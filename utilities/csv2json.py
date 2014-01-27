import sys
import csv
import json

with open(sys.argv[1], 'rb') as csvfile:
    reader = csv.reader(csvfile)
    row = reader.next()
    keys = { }
    for i in range(len(row)):
        key = row[i].strip()
        if key != "":
            keys[key] = i
    result = []
    while True:
        try:
            row = reader.next()
            obj = { }
            for k in keys:
                obj[k] = row[keys[k]]
            result.append(obj)
        except StopIteration:
            break
    open(sys.argv[1] + ".json", "w").write(json.dumps({
        "rows": result
    }))
