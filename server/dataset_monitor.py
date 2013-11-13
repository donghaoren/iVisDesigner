from realtime.document import DocumentRepresentation
import psutil
import time
import redis

rdb  = redis.StrictRedis("localhost", 6379, db=0)
doc = DocumentRepresentation(rdb, "monitor", {
    "measures": []
})

net = psutil.net_io_counters()
net_sbytes = net.bytes_sent
net_rbytes = net.bytes_recv

while True:
    cpu = psutil.cpu_percent()
    mem = psutil.virtual_memory().percent
    net = psutil.net_io_counters()
    net_sb = net.bytes_sent - net_sbytes
    net_sbytes = net.bytes_sent
    net_rb = net.bytes_recv - net_rbytes
    net_rbytes = net.bytes_recv

    m = {
        "time": time.time(),
        "cpu": cpu,
        "net_sent": net_sb,
        "net_recv": net_rb,
        "memory": mem
    }
    doc.append(doc.data, "measures", m)
    if len(doc.data['measures']) > 60:
        doc.pop(doc.data, "measures", 0)
    doc.set(doc.data, "time_min", doc.data['measures'][0]['time'])
    doc.set(doc.data, "time_max", doc.data['measures'][-1]['time'])
    doc.commit()
    time.sleep(0.2)
