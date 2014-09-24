from twisted.python import log
from document import DocumentInfo
import hmac, hashlib
from twisted.internet import reactor
import time
import json

from autobahn.twisted import wamp
from twisted.internet.defer import inlineCallbacks
from db import open_redis, get_redis, get_redis_pubsub
import redis

def load_config(config):
    global hmac_key, allosphere_enabled
    hmac_key = config.get("authentication", "hmac_key")
    allosphere_enabled = config.get("allosphere", "enabled") == "true"
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

        def dataset_mysql(info):
            hostname = info["hostname"] if "hostname" in info else "localhost"
            port = int(info["port"]) if "port" in info else 3306
            username = info["username"] if "username" in info else "anonymous"
            password = info["password"] if "password" in info else ""
            database = info["database"] if "database" in info else "test"
            import MySQLdb
            import MySQLdb.cursors
            connection = MySQLdb.connect(
                host = hostname,
                user = username,
                passwd = password,
                db = database,
                port = port,
                use_unicode = True,
                charset = "utf8",
                cursorclass = MySQLdb.cursors.DictCursor
            )
            cursor = connection.cursor()
            cursor.execute(info["query"])
            rows = list(cursor.fetchall())
            import json, datetime, time
            class MyEncoder(json.JSONEncoder):
                def default(self, obj):
                    if isinstance(obj, datetime.datetime):
                        return int(time.mktime(obj.timetuple()))
                    return json.JSONEncoder.default(self, obj)
            return json.loads(json.dumps({
                "data": { "rows": rows },
                "schema": "unknown"
            }, cls = MyEncoder))

        self.keep_running = True

        def on_shutdown():
            self.keep_running = False
            get_redis().publish("twisted.shutdown", 1)

        reactor.addSystemEventTrigger("before", "shutdown", on_shutdown)

        def wait_for_pmessage():
            print "Waiting for message"
            self.subs = get_redis_pubsub()
            self.subs.psubscribe("doc.*")
            self.subs.psubscribe("twisted.*")
            try:
                for msg in self.subs.listen():
                    if msg['type'] == 'pmessage':
                        print "got a message"
                        reactor.callFromThread(document_changed, msg['channel'], msg['data'])
                    if not self.keep_running:
                        return
            except:
                import traceback
                traceback.print_exc()
                import time
                time.sleep(1)
                pass
            if self.keep_running:
                reactor.callInThread(wait_for_pmessage)

        reactor.callInThread(wait_for_pmessage)

        self.register(document_get, u'document.get')
        self.register(document_diff, u'document.diff')
        self.register(dataset_mysql, u'dataset.mysql')

        if allosphere_enabled:
            from allosphere import send_message
            def on_allosphere_message(message):
                send_message(message)
            self.subscribe(on_allosphere_message, "iv.allosphere.message")
