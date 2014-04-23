from twisted.python import log
from subscriptions import add_subscription_handler, remove_subscription_client
from document import DocumentInfo
import hmac, hashlib
from twisted.internet import reactor
import time
import json

def load_config(config):
    global hmac_key, client_lifetime, client_callback_lifetime, clients, rdb
    hmac_key = config.get("authentication", "hmac_key")
    client_lifetime = int(config.get("realtime", "client_timeout"))
    client_callback_lifetime = int(config.get("realtime", "polling_timeout"))
    clients = { }
    from db import open_redis
    rdb = open_redis(config)

from threading import Thread, Lock, current_thread

class SubscriptionThread(Thread):
    should_stop = False
    def __init__(self, main_thread, rdb, callback):
        Thread.__init__(self)
        self.callback = callback
        # Here we subscribe to all events.
        self.rdb = rdb
        self.subs = rdb.pubsub()
        self.subs.psubscribe("twisted.*")

        def on_shutdown():
            self.should_stop = True
            self.rdb.publish("twisted.stop", 1)
            self.join()

        reactor.addSystemEventTrigger("before", "shutdown", on_shutdown)

    def run(self):
        while not self.should_stop:
            for msg in self.subs.listen():
                if msg['type'] == 'pmessage':
                    reactor.callFromThread(self.callback, msg['channel'], msg['data'])
                if self.should_stop:
                    break
            # The for loop breaks when there's no subscriptions.
            # Wait for 10ms then.
            time.sleep(0.01)

from autobahn.twisted import wamp
from twisted.internet.defer import inlineCallbacks

class DocumentSession(wamp.ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        # Get a document.
        def document_get(name):
            doc = DocumentInfo(rdb, name)
            r = { "data": doc.get_data(), "revision": doc.get_revision() }
            return r

        def document_diff(name = None, revision = None):
            if revision == None: revision = 0
            doc = DocumentInfo(rdb, name)
            diff = doc.get_diff(revision)
            return diff

        def document_changed(channel, data):
            if channel.startswith("doc."):
                print "publish", channel, data
                self.publish(channel, data)

        self.thread = SubscriptionThread(current_thread(), rdb, document_changed)
        self.thread.subs.psubscribe("doc.*")

        yield self.register(document_get, u'document.get')
        yield self.register(document_diff, u'document.diff')

        self.thread.start()
