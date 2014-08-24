from autobahn.twisted import wamp, websocket
from twisted.application import internet
from twisted.internet.defer import inlineCallbacks

from session import IVRouterSession

import client

class IVWampServer(internet.TCPServer):
    def startService(self):
        internet.TCPServer.startService(self)
        self.session_factory.add(client.DocumentSession())

    def setSessionFactory(self, session_factory):
        self.session_factory = session_factory

def get_wamp_service(config):
    debug = config.get("websocket", "debug") == "true"
    client.load_config(config)

    router_factory = wamp.RouterFactory()
    session_factory = wamp.RouterSessionFactory(router_factory)
    session_factory.session = IVRouterSession


    transport_factory = websocket.WampWebSocketServerFactory(
        session_factory,
        debug = debug,
        debug_wamp = debug
    )

    server = IVWampServer(int(config.get("websocket", "port")), transport_factory, interface = config.get("websocket", "interface"))
    server.setSessionFactory(session_factory)
    return server
