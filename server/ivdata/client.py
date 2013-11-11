from db import rdb
from config import config
from log import log
from subscriptions import add_subscription_handler, remove_subscription_client
from document import DocumentInfo
import hmac, hashlib
from twisted.internet import reactor
import time
import json

hmac_key = config.get("authentication", "hmac_key")
client_lifetime = int(config.get("client", "lifetime"))
client_callback_lifetime = int(config.get("client", "callback_lifetime"))
clients = { }

def require_key(args, key, default = "RAISE"):
    if not key in args:
        if default != "RAISE": return default
        raise Exception("E_INVALID_ARGS")
    return args[key]

class ClientInfo:
    last_action = time.time()
    def __init__(self, sid):
        self.sid = sid
        self.callback = None
        self.messages = []

    def feed(self):
        self.last_action = time.time()

    def unfeed_time(self):
        return time.time() - self.last_action

    def add_message(self, msg):
        self.messages.append(msg)
        reactor.callLater(0.001, self.post_message)

    def post_message(self):
        if len(self.messages) != 0 and self.callback != None:
            self.callback({ "status": "success", "messages": self.messages })
            self.callback = None
            self.messages = []

    def assign_callback(self, callback):
        self.post_message()
        self.callback = callback
        self.post_message()

    def finish_callback(self):
        self.post_message()
        if self.callback:
            self.callback({ "status": "success", "messages": [] })
            self.callback = None

def auth_client(args):
    if 'sid' in args:
        sid = args['sid']
        if sid in clients:
            return clients[sid]
        hmac_digest = ''
        if 'hmac' in args: hmac_digest = args['hmac']
        if hmac_key != "":
            computed_digest = hmac.new(hmac_key, sid, hashlib.sha1).hexdigest()
            if hmac_digest != computed_digest:
                raise Exception("E_AUTHENTICATION_FAILURE")

        log("Add Client: %s" % sid)
        clients[sid] = ClientInfo(sid)
        return clients[sid]
    else:
        raise Exception("E_AUTHENTICATION_FAILURE")

def cleanup_clients():
    to_remove = []
    for sid in clients:
        hungry = clients[sid].unfeed_time()
        if hungry > client_lifetime:
            to_remove.append(sid)
        elif hungry > client_callback_lifetime:
            clients[sid].finish_callback()

    for sid in to_remove:
        remove_subscription_client(sid)
        del clients[sid]
        log("Remove Client: %s" % sid)


def request_handler(action, args, callback):
    # Register: add a new user (or overwrite existing one).
    if action == "register":
        c = auth_client(args)
        c.feed()
        return True

    if action == "document.get":
        c = auth_client(args)
        c.feed()
        doc = DocumentInfo(rdb, require_key(args, "name"))
        return { "status": "success", "document": doc.get_data() }

    if action == "document.listen":
        c = auth_client(args)
        c.feed()
        doc = DocumentInfo(rdb, require_key(args, "name"))
        rev = [doc.get_revision()]
        def handler(m):
            new_rev = doc.get_revision()
            c.add_message({
                "channel": "doc.%s" % doc.name, "message": m,
                "oplog": doc.get_diff(rev[0])
            })
            rev[0] = new_rev
        add_subscription_handler(doc.k_publish, c.sid, handler)
        return { "status": "success", "data": doc.get_data(), "rev": doc.get_revision() }

    if action == "messages.get":
        c = auth_client(args)
        c.feed()
        c.assign_callback(callback)
        return None # Not done yet.
