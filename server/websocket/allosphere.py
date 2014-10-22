from twisted.internet.protocol import Factory, Protocol
from twisted.protocols.basic import LineReceiver
from twisted.internet import reactor
from twisted.application.internet import TCPServer
import struct

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

    def buildProtocol(self, addr):
        return Server(self)

def get_allosphere_service(config):
    global current_factory
    current_factory = ServerFactory()
    return TCPServer(int(config.get("allosphere", "socket_port")), current_factory, interface = config.get("allosphere", "interface"))

def send_message(message):
    global current_factory
    info = message.encode("utf-8")
    info = struct.pack("i", len(info)) + info
    for client in current_factory.clients:
        try: client.transport.write(info)
        except: pass
