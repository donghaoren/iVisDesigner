from autobahn.wamp import router
from autobahn.twisted import wamp, websocket
from twisted.application import internet
from twisted.internet.defer import inlineCallbacks

from session import IVRouterSession

import client

def get_wamp_service(config):
    debug = config.get("websocket", "debug") == "true"
    client.load_config(config)

    router_factory = router.RouterFactory()
    session_factory = wamp.RouterSessionFactory(router_factory)
    session_factory.session = IVRouterSession
    session_factory.add(client.DocumentSession())

    transport_factory = websocket.WampWebSocketServerFactory(
        session_factory,
        debug = debug,
        debug_wamp = debug
    )

    return internet.TCPServer(int(config.get("websocket", "port")), transport_factory, interface = config.get("websocket", "interface"))
