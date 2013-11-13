import time
import json
import hmac
import hashlib
import json

import client

from twisted.web import server, resource
from twisted.web.static import File as StaticFile
from twisted.internet import reactor, task

from db import open_redis
from realtime.subscriptions import SubscriptionThread

class MainResource(resource.Resource):
    isLeaf = True
    def __init__(self, config):
        resource.Resource.__init__(self)

        self.config = config
        self.rdb = open_redis(config)
        client.load_config(config, self.rdb)

        task.LoopingCall(self.every_second).start(1)

        def startSubscription():
            subs_thread = SubscriptionThread(self.rdb)
            subs_thread.start()
            reactor.addSystemEventTrigger('before', 'shutdown', subs_thread.trigger_stop)

        reactor.callLater(0, startSubscription)

    def _delayedRender(self, request, response):
        try:
            request.write(response)
            request.finish()
        except:
            pass

    def render_POST(self, request):
        request.setHeader("content-type", "text/plain; charset=utf-8")

        try:
            if not 'request' in request.args: return json.dumps({ "status": "E_INVALID_ARGS" })
            args = json.loads(request.args['request'][0].decode("UTF-8"))
        except:
            return json.dumps({ "status": "E_INVALID_ARGS" })
        try:
            r = self.request_handler(args, lambda res: self._delayedRender(request, json.dumps(res).encode("utf-8")))
        except Exception as e:
            r = { "status": e.message }
        if r != None:
            if r == True:
                r = { "status": "success" }
            return json.dumps(r).encode("utf-8")
        return server.NOT_DONE_YET

    def every_second(self):
        client.cleanup_clients()

    def request_handler(self, args, callback):
        if not 'action' in args:
            raise Exception("E_INVALID_ARGS")
        r = client.request_handler(args['action'], args, callback)
        if r != False: return r
        raise Exception("E_INVALID_ARGS")
