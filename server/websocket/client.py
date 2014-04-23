from twisted.python import log
from subscriptions import add_subscription_handler, remove_subscription_client
from document import DocumentInfo
import hmac, hashlib
from twisted.internet import reactor
import time
import json

from autobahn.twisted import wamp
from twisted.internet.defer import inlineCallbacks
from db import open_redis, get_redis
import redis

def load_config(config):
    global hmac_key
    hmac_key = config.get("authentication", "hmac_key")

    open_redis(config)

class DocumentSession(wamp.ApplicationSession):
    def onJoin(self, details):
        # Get a document.
        def document_get(name):
            doc = DocumentInfo(get_redis(), name)
            r = { "data": doc.get_data(), "revision": doc.get_revision() }
            return r

        def document_diff(name = None, revision = None):
            if revision == None: revision = 0
            doc = DocumentInfo(get_redis(), name)
            diff = doc.get_diff(revision)
            return diff

        def document_changed(channel, data):
            if channel.startswith("doc."):
                self.publish(channel, data)

        self.subs = get_redis().pubsub()
        self.subs.psubscribe("doc.*")
        self.subs.psubscribe("twisted.*")

        self.keep_running = True

        def on_shutdown():
            self.keep_running = False
            get_redis().publish("twisted.shutdown", 1)

        reactor.addSystemEventTrigger("before", "shutdown", on_shutdown)

        def wait_for_pmessage():
            try:
                for msg in self.subs.listen():
                    if msg['type'] == 'pmessage':
                        reactor.callFromThread(document_changed, msg['channel'], msg['data'])
                    if not self.keep_running:
                        return
            except:
                pass
            if self.keep_running:
                reactor.callInThread(wait_for_pmessage)

        reactor.callInThread(wait_for_pmessage)

        self.register(document_get, u'document.get')
        self.register(document_diff, u'document.diff')
