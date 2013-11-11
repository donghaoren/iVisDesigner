import os
from config import config
from core import MainResource
from subscriptions import SubscriptionThread

from twisted.application import service, internet
from twisted.web import static, server
from twisted.internet import reactor

def getWebService():
    s = server.Site(MainResource())
    return internet.TCPServer(int(config.get("server", "port")), s)

subs_thread = SubscriptionThread()
subs_thread.start()
reactor.addSystemEventTrigger('before', 'shutdown', subs_thread.trigger_stop)

application = service.Application("iVisDesigner Realtime Data Service")
service = getWebService()
service.setServiceParent(application)
