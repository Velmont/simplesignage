import json
from collections import OrderedDict


class ItemManager(object):
    json_file_name = 'saved_data.json'

    def __init__(self):
        self.items = OrderedDict()
        self.read_from_disk()

    def read_from_disk(self):
        try:
            with open(self.json_file_name, 'r') as fp:
                data = json.load(fp)
        except FileNotFoundError:
            data = {}
        items_data = data.get('items', [])
        for item_data in items_data:
            item = Item.from_dict(item_data);
            self.items[item.name] = item

    def save_to_disk(self):
        data = json.dumps({
            'items': [item.to_dict() for item in self.items.values()],
        })
        with open(self.json_file_name, 'w') as fp:
            fp.write(data)

    def create(self, name, optionals=None):
        item = Item(name, **(optionals or {}))
        self.items[item.name] = item

    def get(self, name):
        return self.items[name]



class Item(object):
    def __init__(self, name, active=False, time=4000):
        self.name = name
        self.active = active
        self.time = time

    @property
    def url(self):
        return '/uploads/%s' % self.name

    def to_dict(self):
        """
        Dict saved to disk, opposite of from_dict
        """
        return self.__dict__

    def to_data_dict(self):
        """
        Dict sent via web API to the client/viewer
        """
        return {
          'name': self.name,
          'url': self.url,
          'active': self.active,
          'time': self.time,
        }

    @classmethod
    def from_dict(cls, fields):
        return Item(**fields)
