from twisted.python import log
from subscriptions import add_subscription_handler, remove_subscription_client
from document import DocumentInfo
import hmac, hashlib
from twisted.internet import reactor
import time
import json

from autobahn.twisted import wamp
from twisted.internet.defer import inlineCallbacks

def load_config(config):
    global hmac_key, client_lifetime, client_callback_lifetime, clients, rdb
    hmac_key = config.get("authentication", "hmac_key")
    client_lifetime = int(config.get("realtime", "client_timeout"))
    client_callback_lifetime = int(config.get("realtime", "polling_timeout"))
    clients = { }
    from db import open_redis
    rdb = open_redis(config)

class DocumentSession(wamp.ApplicationSession):
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
                self.publish(channel, data)

        subs = rdb.pubsub()
        subs.psubscribe("doc.*")
        subs.psubscribe("twisted.*")

        def on_shutdown():
            rdb.publish("twisted.stop", 1)
        reactor.addSystemEventTrigger("before", "shutdown", on_shutdown)

        def wait_for_pmessage():
            try:
                for msg in subs.listen():
                    if msg['type'] == 'pmessage':
                        reactor.callFromThread(document_changed, msg['channel'], msg['data'])
            except:
                pass
            reactor.callInThread(wait_for_pmessage)

        reactor.callInThread(wait_for_pmessage)

        self.register(document_get, u'document.get')
        self.register(document_diff, u'document.diff')
