from db import rdb
from threading import Thread, Lock
from twisted.internet import reactor
import time
from log import log

subscription_keys = { }
subscription_clients = { }

class SubscriptionThread(Thread):
    should_stop = False
    subs = rdb.pubsub()
    def __init__(self):
        Thread.__init__(self)
        # Here we subscribe to all events.
        self.subs.psubscribe("doc.*")
        self.subs.psubscribe("control.*")

    def trigger_stop(self):
        self.should_stop = True
        rdb.publish("control.stop", 1)

    def run(self):
        while not self.should_stop:
            for msg in self.subs.listen():
                if msg['type'] == 'pmessage':
                    channel = msg['channel']
                    if channel in subscription_keys:
                        for func in subscription_keys[channel].itervalues():
                            reactor.callFromThread(func, msg['data'])
                if self.should_stop:
                    break
            # The for loop breaks when there's no subscriptions.
            # Wait for 10ms then.
            time.sleep(0.01)


def add_subscription_handler(key, sid, func):
    if not key in subscription_keys:
        subscription_keys[key] = { }
        log("Subscribe: %s" % key)
    subscription_keys[key][sid] = func
    if not sid in subscription_clients:
        subscription_clients[sid] = [ key ]
    else:
        subscription_clients[sid].append(key)

def remove_subscription_client(sid):
    if sid in subscription_clients:
        for key in subscription_clients[sid]:
            del subscription_keys[key][sid]
