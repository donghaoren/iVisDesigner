#!./ENV/bin/twistd -ny

import os

from server.config import config
from websocket.wamp import get_wamp_service

from twisted.application import service, internet
from twisted.web import static, server
from twisted.internet import reactor, task

reactor.suggestThreadPoolSize(8)

application = service.Application("iVisDesigner Realtime Data Service")

realtime_service = get_wamp_service(config)
realtime_service.setServiceParent(application)
