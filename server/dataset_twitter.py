# Twitter Streaming Dataset

from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
import json

import ConfigParser

config = ConfigParser.ConfigParser()
config.read("dataset_config.ini")

consumer_key = config.get("twitter", "consumer_key")
consumer_secret = config.get("twitter", "consumer_secret")
access_token = config.get("twitter", "access_token")
access_token_secret = config.get("twitter", "access_token_secret")

class StdOutListener(StreamListener):
    def on_data(self, data):
        data = json.loads(data)
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
