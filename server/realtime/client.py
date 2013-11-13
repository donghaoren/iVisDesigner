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
        self.serial = 0

    def feed(self):
        self.last_action = time.time()

    def unfeed_time(self):
        return time.time() - self.last_action

    def add_message(self, msg):
        msg['serial'] = self.serial
        self.messages.append(msg)
        self.serial += 1
        reactor.callLater(0.001, self.post_message)

    def remove_old_messages(self, serial):
        # Pop all messages whose serial is smaller than or equals to 'serial'.
        while len(self.messages) > 0 and self.messages[0]['serial'] <= serial:
            self.messages.pop(0)

    def post_message(self):
        # Post all messages in the queue if exists, and finalize the callback.
        if len(self.messages) != 0 and self.callback != None:
            self.callback({ "status": "success", "messages": self.messages })
            self.callback = None

    def assign_callback(self, callback):
        # If we have a existing callback, finish it.
        self.finish_callback()
        # Assign new callback.
        self.callback = callback
        # If there is message, post.
        self.post_message()

    def finish_callback(self):
        # If there is message, post.
        self.post_message()
        # Otherwise, respond empty and clear it.
        if self.callback:
            self.callback({ "status": "success", "messages": [] })
            self.callback = None

def auth_client(args, register = False):
    if 'sid' in args:
        sid = args['sid']
        if sid in clients:
            return clients[sid]
        if not register:
            raise Exception("E_AUTHENTICATION_FAILURE")
        hmac_digest = ''
        if 'hmac' in args: hmac_digest = args['hmac']
        if hmac_key != "":
            computed_digest = hmac.new(hmac_key, "register:" + sid, hashlib.sha1).hexdigest()
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
        c = auth_client(args, register = True)
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
        serial = require_key(args, "serial", 0)
        c.remove_old_messages(serial)
        c.assign_callback(callback)
        return None # Not done yet.
