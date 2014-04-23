import redis
from twisted.python import log

def open_redis(config):
    global redis_pool
    host = config.get("redis", "host")
    port = int(config.get("redis", "port"))
    socket = config.get("redis", "socket")
    if socket != "":
        redis_pool = redis.ConnectionPool(
            connection_class = redis.connection.UnixDomainSocketConnection,
            path = socket
        )
    else:
        redis_pool = redis.ConnectionPool(
            host = host,
            port = port,
            db = 0
        )

def get_redis():
    global redis_pool
    return redis.StrictRedis(connection_pool = redis_pool)
