import redis
from config import config

rdb = redis.StrictRedis(config.get("redis", "host"), int(config.get("redis", "port")), db=0)
print "Connected to redis database localhost:6379"
