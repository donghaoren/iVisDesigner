import os
from config import config
from core import MainResource, every_second
from subscriptions import SubscriptionThread

from twisted.application import service, internet
from twisted.web import static, server
from twisted.internet import reactor, task

def getWebService():
    s = server.Site(MainResource())
    return internet.TCPServer(int(config.get("server", "port")), s)

reactor.suggestThreadPoolSize(4)
task.LoopingCall(every_second).start(1)

def startSubscription():
    subs_thread = SubscriptionThread()
    subs_thread.start()
    reactor.addSystemEventTrigger('before', 'shutdown', subs_thread.trigger_stop)

reactor.callLater(0, startSubscription)

application = service.Application("iVisDesigner Realtime Data Service")
service = getWebService()
service.setServiceParent(application)
