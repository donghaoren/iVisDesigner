# Twitter Streaming Dataset

from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
import json
from realtime.document import DocumentRepresentation
import redis
import time

rdb  = redis.StrictRedis("localhost", 6379, db=0)
doc = DocumentRepresentation(rdb, "twitter_streaming", {
    "tweets": []
})

import ConfigParser

config = ConfigParser.ConfigParser()
config.read("dataset_config.ini")

consumer_key = config.get("twitter", "consumer_key")
consumer_secret = config.get("twitter", "consumer_secret")
access_token = config.get("twitter", "access_token")
access_token_secret = config.get("twitter", "access_token_secret")

last_time = 0

class StdOutListener(StreamListener):
    def on_data(self, data):
        data = json.loads(data)
        if 'user' in data:
            doc.append(doc.data, "tweets", data)
            if len(doc.data['tweets']) > 1000:
                doc.pop(doc.data, "tweets", 0)
            global last_time
            if time.time() - last_time > 0.5:
                doc.commit()
                last_time = time.time()
        print json.dumps(data, indent=2)
        return True

    def on_error(self, status):
        print status

if __name__ == '__main__':
    l = StdOutListener()
    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)

    stream = Stream(auth, l)
    stream.sample()

schema = """
type: object
source:
  type: realtime
  host: "[this]"
  sid: "1"
  name: "twitter_streaming"
fields:
  time_min: { type: number }
  time_max: { type: number }
  tweets:
    type: collection
    fields:
      text: { type: string }
      retweeted: { type: boolean }
      retweet_count: { type: number }
      created_at: { type: string }
      user:
        type: object
        fields:
            verified: { type: boolean }
            followers_count: { type: number }
            listed_count: { type: number }
            statuses_count: { type: number }
            friends_count: { type: number }
            favourites_count: { type: number }
            created_at: { type: string }
""".strip()
