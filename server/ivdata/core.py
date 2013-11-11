import time
import json
import hmac
import hashlib

import client

registered_clients = { }
registered_groups = { }



def push_item(item):
    global registered_clients, registered_groups
    cids = set()
    if 'target' in item:
        cids.add(item['target'])
    if 'targets' in item:
        cids.update(item['targets'])
    if 'target_group' in item:
        if item['target_group'] in registered_groups:
            cids.update(registered_groups[item['target_group']]['clients'])
    for cid in cids:
        if not cid in registered_clients: continue
        registered_clients[cid]['messages'].append(item)

def notify_client(c):
    if c['pull_callback'] != None:
        if len(c['messages']) > 0 or time.time() - c['pull_time']:
            c['pull_callback'](c['messages'])
            c['messages'] = []
            c['pull_callback'] = None

def notify_clients():
    global registered_clients, registered_groups
    for cid in registered_clients:
        notify_client(registered_clients[cid])

def add_client(client_id, hmac_digest = ""):
    global registered_clients, registered_groups
    if hmac_key != "":
        computed_digest = hmac.new(hmac_key, client_id, hashlib.sha1).hexdigest()
        if hmac_digest != computed_digest:
            raise Exception("E_PERMISSION_DENIED")
    print "Add Client: %s" % client_id
    registered_clients[client_id] = {
        'client_id': client_id,
        'messages': [],
        'last_access': time.time(),
        'pull_callback': None,
        'pull_time': None
    }

def add_client_group(client_id, group):
    global registered_clients, registered_groups
    if group in registered_groups:
        registered_groups[group]['clients'].add(client_id)
    else:
        registered_groups[group] = {
            'clients': set([client_id])
        }

def every_second():
    client.cleanup_clients()

def request_handler(args, callback):
    if not 'action' in args:
        raise Exception("E_INVALID_ARGS")
    r = client.request_handler(args['action'], args, callback)
    if r != False: return r
    raise Exception("E_INVALID_ARGS")
