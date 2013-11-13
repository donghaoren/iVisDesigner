import ConfigParser

# Read configuration file.
cfg = ConfigParser.ConfigParser()
# Default settings.
cfg.add_section("authentication")
cfg.set("authentication", "hmac_key", "")

cfg.add_section("server")
cfg.set("server", "port", "8001")
cfg.set("server", "public_directory", "public")

cfg.add_section("redis")
cfg.set("redis", "host", "localhost")
cfg.set("redis", "port", "6379")

cfg.add_section("client")
cfg.set("client", "callback_lifetime", "10")
cfg.set("client", "lifetime", "600")

cfg.read("config.ini")

config = cfg
