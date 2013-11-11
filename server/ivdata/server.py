#!/usr/bin/python

from core import request_handler, every_second
from config import config
from subscriptions import SubscriptionThread

from twisted.web import server, resource
from twisted.web.static import File as StaticFile
from twisted.internet import reactor, task
import json
import zope.interface
import sys

import signal

class MyResource(resource.Resource):
    isLeaf = True
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
            r = request_handler(args, lambda res: self._delayedRender(request, json.dumps(res).encode("utf-8")))
        except Exception as e:
            r = { "status": e.message }
        if r != None:
            if r == True:
                r = { "status": "success" }
            return json.dumps(r).encode("utf-8")
        return server.NOT_DONE_YET

# class Dispatcher(resource.Resource):
#     def getChild(self, name, request):
#         if name == "pull": return my_rs
#         elif name == "pub": return my_ss
#         else: return my_ss

#my_rs = MyResource()
#my_ss = StaticFile(config.get("server", "public_directory"))

port = int(config.get("server", "port"))
if len(sys.argv) == 2: port = int(sys.argv[1])

print "Listening on *:%s..." % str(port)
reactor.listenTCP(port, server.Site(MyResource()))
reactor.suggestThreadPoolSize(4)
task.LoopingCall(every_second).start(1)

subs_thread = SubscriptionThread()
subs_thread.start()
reactor.run()
subs_thread.trigger_stop()
