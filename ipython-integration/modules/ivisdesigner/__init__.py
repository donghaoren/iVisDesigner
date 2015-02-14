from IPython.html import widgets
from IPython.display import display
from IPython.utils.traitlets import Unicode
import json

class Widget(widgets.DOMWidget):
    _view_name = Unicode('ivView', sync = True)
    dataset = Unicode(sync = True)
    visualization = Unicode(sync = True)
    
    def constructSchema(self, data):
        field_map = { "type": "object", "fields": { } }
        def iterate(fm, item):
            fields = fm['fields']
            for key in item:
                if not key in fields:
                    val = item[key]
                    if type(val) == int or type(val) == float:
                        fields[key] = { "type": "number" }
                    if type(val) == str or type(val) == unicode:
                        fields[key] = { "type": "string" }
                    if type(val) == dict:
                        fields[key] = { "type": "object", "fields": { } }
                        iterate(fields[key], item[key])
                    if type(val) == list:
                        fields[key] = { "type": "collection", "fields": { } }
                        for listitem in item[key]:
                            if type(listitem) == dict:
                                iterate(fields[key], listitem)
        iterate(field_map, data)
        return field_map
    
    def getVisualization(self):
        self.send({"type": "visualization.get"})
    
    def setData(self, data, schema = None):
        data = json.loads(json.dumps(data))
        if schema == None:
            schema = self.constructSchema(data)
        self.dataset = json.dumps({ "data": data, "schema": schema })     
    
    def __init__(self, data = { }, schema = None, **kwargs):
        super(Widget, self).__init__(**kwargs)
        # Serialize and deserialize, make sure it's uniform.
        data = json.loads(json.dumps(data))
        if schema == None:
            schema = self.constructSchema(data)
        self.dataset = json.dumps({ "data": data, "schema": schema })
        self.validate = widgets.CallbackDispatcher()
