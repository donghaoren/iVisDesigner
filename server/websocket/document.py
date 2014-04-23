import json
import random
from copy import deepcopy

def generateUUID():
    s = ''
    for i in range(10):
        s += random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz~!@#$%^&*()_+=-{}][:;?><,./|")
    return s

def ensureUUID(obj):
    if isinstance(obj, dict):
        if not '_id' in obj:
            for key in obj: ensureUUID(obj[key])
            obj['_id'] = generateUUID()
    if isinstance(obj, list):
        for o in obj:
            ensureUUID(o)
    return obj

class DocumentInfo:
    def __init__(self, rdb, name):
        self.rdb = rdb
        self.name = name
        self.k_content = "doc.%s.content" % name
        self.k_revision = "doc.%s.revision" % name
        self.k_oplog = "doc.%s.oplog" % name
        self.k_publish = "doc.%s.news" % name
    def get_revision(self):
        return int(self.rdb.get(self.k_revision))
    def get_data(self):
        d = self.rdb.get(self.k_content)
        if d: return json.loads(d)
        return ensureUUID({})
    def get_oplogs(self, count = 0):
        return self.rdb.lrange(self.k_oplog, 0, count - 1)
    def get_diff(self, rev = 0):
        oplogs = []
        start = 0
        end = self.get_revision() - rev - 1
        while True:
            r = [ json.loads(x) for x in self.rdb.lrange(self.k_oplog, start, end) ]
            if len(r) == 0: break
            oplogs += r
            if oplogs[-1][0] <= rev + 1: break
            start = end + 1
            end = start + 5
        return oplogs

class DocumentRepresentation(DocumentInfo):
    max_oplog = 100  # Keep only 100 oplogs.

    def __init__(self, rdb, name, data = None):
        DocumentInfo.__init__(self, rdb, name)
        self.oplogs = []
        if data == None:
            self.data = self.get_data()
        else:
            ensureUUID(data)
            self.data = data
            self.rdb.set(self.k_content, json.dumps(data))
            self._oplog("INITIALIZE", data)
            self.commit()

    # S(set), _id, key, value
    def set(self, obj, key, value, ref = False):
        ensureUUID(value)
        if ref: value = { "ref_id": value['_id'] }
        obj[key] = value
        self._oplog("S", obj['_id'], key, value)

    # U(unset), _id, key
    def unset(self, obj, key):
        del obj[key]
        self._oplog("U", obj['_id'], key)

    # A(append), _id, key, value
    def append(self, obj, key, value, ref = False):
        ensureUUID(value)
        if ref: value = { "ref_id": value['_id'] }
        obj[key].append(value)
        self._oplog("A", obj['_id'], key, value)

    # I(insert), _id, key, index, value
    def insert(self, obj, key, index, value, ref = False):
        ensureUUID(value)
        if ref: value = { "ref_id": value['_id'] }
        obj[key].insert(index, value)
        self._oplog("I", obj['_id'], key, index, value)

    # P(pop), _id, key, index
    def pop(self, obj, key, index = None):
        if index == None: obj[key].pop()
        else: obj[key].pop(index)
        self._oplog("P", obj['_id'], key, index)

    def _oplog(self, *args):
        self.oplogs += deepcopy(args)

    # commit previous operations.
    def commit(self):
        if len(self.oplogs) == 0: return
        self.rdb.set(self.k_content, json.dumps(self.data))
        rev = self.rdb.incrby(self.k_revision, 1)
        self.rdb.lpush(self.k_oplog, json.dumps([rev] + self.oplogs))
        self.rdb.ltrim(self.k_oplog, 0, self.max_oplog - 1)
        self.rdb.publish(self.k_publish, json.dumps([rev] + self.oplogs))
        self.oplogs = []
