import redis
from twisted.python import log

def open_redis(config):
    host = config.get("redis", "host")
    port = int(config.get("redis", "port"))
    rdb = redis.StrictRedis(host, port, db=0)
    log.msg("Connected to redis database %s:%d" % (host, port))
    return rdb
