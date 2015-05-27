from server.config import config
import sys
import zmq
import struct

local_port = int(config.get("allosphere", "socket_port"))
local_ip = "127.0.0.1"

zmq_context = zmq.Context()
zmq_pub = zmq_context.socket(zmq.PUB)
zmq_pub.setsockopt(zmq.SNDHWM, int(config.get("allosphere", "zmq_sndhwm")))
zmq_pub.setsockopt(zmq.SNDBUF, int(config.get("allosphere", "zmq_sndbuf")))
zmq_pub.setsockopt(zmq.RATE, int(config.get("allosphere", "zmq_rate")))
zmq_pub.bind(config.get("allosphere", "zmq_publish"))

import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((local_ip, local_port))

def recv_until(s, length):
    r = ""
    while len(r) < length:
        r += s.recv(length - len(r))
    return r

while True:
    plen = struct.unpack("i", recv_until(s, 4))[0]
    data = recv_until(s, plen)
    zmq_pub.send(data)
