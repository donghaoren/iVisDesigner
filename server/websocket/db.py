import redis
from twisted.python import log

def open_redis(config):
    global redis_pool, redis_info
    host = config.get("redis", "host")
    port = int(config.get("redis", "port"))
    socket = config.get("redis", "socket")
    redis_info = ( host, port, socket )

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

def get_redis_pubsub():
    global redis_info
    host, port, socket = redis_info

    if socket != "":
        conn = redis.StrictRedis(
            connection_class = redis.connection.UnixDomainSocketConnection,
            path = socket
        )
    else:
        conn = redis.StrictRedis(
            host = host,
            port = port,
            db = 0
        )

    return conn.pubsub()
