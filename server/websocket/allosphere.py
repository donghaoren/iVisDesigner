from twisted.internet.protocol import Factory, Protocol
from twisted.protocols.basic import LineReceiver
from twisted.internet import reactor
from twisted.application.internet import TCPServer
import struct
import zmq

class Server(Protocol):
    def __init__(self, factory):
        self.factory = factory
        factory.clients.add(self)

    def connectionMade(self):
        pass
        # self.factory.numProtocols = self.factory.numProtocols + 1
        # self.transport.write(
        #     "Welcome! There are currently %d open connections.\n" %
        #     (self.factory.numProtocols,))

    def connectionLost(self, reason):
        self.factory.clients.discard(self)

    def dataReceived(self, data):
        pass

class ServerFactory(Factory):
    def __init__(self):
        self.clients = set() # maps user names to Chat instances
        self.zmq_context = zmq.Context()
        self.zmq_pub = zmq.Socket(self.zmq_context, zmq.PUB)

    def buildProtocol(self, addr):
        return Server(self)

def get_allosphere_service(config):
    global current_factory
    current_factory = ServerFactory()
    current_factory.zmq_pub.bind(config.get("allosphere", "zmq_publish"))
    current_factory.zmq_pub.setsockopt(zmq.SNDHWM, config.get("allosphere", "zmq_sndhwm"))
    current_factory.zmq_pub.setsockopt(zmq.SNDBUF, config.get("allosphere", "zmq_sndbuf"))
    current_factory.zmq_pub.setsockopt(zmq.RATE, config.get("allosphere", "zmq_rate"))
    return TCPServer(int(config.get("allosphere", "socket_port")), current_factory, interface = config.get("allosphere", "interface"))

def send_message(message):
    global current_factory
    info = message.encode("utf-8")
    current_factory.zmq_pub.send(info)
    info = struct.pack("i", len(info)) + info
    for client in current_factory.clients:
        try: client.transport.write(info)
        except: pass
