# The config file.
import ConfigParser

# Read configuration file.
config = ConfigParser.ConfigParser()
# Default settings.
config.add_section("authentication")
config.set("authentication", "hmac_key", "")

# Realtime server settings.
config.add_section("realtime")
config.set("realtime", "port", "8001")
config.set("realtime", "interface", "127.0.0.1")
config.set("realtime", "polling_timeout", "10")
config.set("realtime", "client_timeout", "600")

# Redis server settings.
config.add_section("redis")
config.set("redis", "host", "localhost")
config.set("redis", "port", "6379")

# Django settings.
config.add_section("django")
config.set("django","debug", "yes")
config.set("django","timezone", "America/Chicago")
config.set("django","media_root", "")
config.set("django","media_url", "")
config.set("django","static_root", "")
config.set("django","static_url", "")
config.set("django","use_x_forwarded_host", "no")
config.set("django","force_script_name", "")
config.set("django","staticfiles_dirs", "")
config.set("django","allowed_hosts", "")

# Relational database.
config.add_section("database")
config.set("database", "engine", "django.db.backends.sqlite3")
config.set("database", "name", "db.sqlite3")
config.set("database", "user", "")
config.set("database", "password", "")
config.set("database", "host", "")
config.set("database", "port", "")

config.read("config.ini")

DEBUG = config.get("django", "debug") == "yes"

HMAC_KEY = config.get("authentication", "hmac_key")

DATABASES = {
    'default': {
        'ENGINE': config.get("database", "engine"),   # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': config.get("database", "name"),           # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': config.get("database", "user"),
        'PASSWORD': config.get("database", "password"),
        'HOST': config.get("database", "host"),                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': config.get("database", "port"),                      # Set to empty string for default.
    }
}

TIME_ZONE = config.get("django", "timezone")

MEDIA_ROOT = config.get("django", "media_root")
MEDIA_URL = config.get("django", "media_url")

STATIC_ROOT = config.get("django", "static_root")
STATIC_URL = config.get("django", "static_url")

USE_X_FORWARDED_HOST = config.get("django", "use_x_forwarded_host") == "yes"
FORCE_SCRIPT_NAME = config.get("django", "force_script_name")

ALLOWED_HOSTS = config.get("django", "allowed_hosts").split(";")

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)
