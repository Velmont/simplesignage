'use strict';

class ItemManager extends Map {
  updateData() {
    return fetch('/data.json')
      .then(response => response.json())
      .then(data => this.updateFromAPIData_(data));
  }

  updateFromAPIData_(data) {
    for (let itemData of data) {
      let item = this.get(itemData.name);
      if (item) {
        item.updateFromAPI(itemData);
      } else {
        let item = Item.fromAPI(itemData);
        this.set(item.name, item);
      }
    }
  }

  nextItem(previousItem) {
    // Currently don't have a better way to do ordering
    let alternatives = Array.from(this.entries())
      .filter(entry => entry[1].active)
      .map(entry => entry[0]);
    let nextKey = alternatives[0];
    if (previousItem) {
      let idx = alternatives.indexOf(previousItem.name);
      if (idx >= 0) {
        nextKey = alternatives[(idx + 1) % alternatives.length]
      }
    }
    return this.get(nextKey);
  }
}

class Item {
  constructor(name, url, active, time) {
    this.name = name;
    this.url = url;
    this.active_ = active;
    this.time_ = time;
  }

  get active() {
    return this.active_;
  }

  set active(value) {
    this.active_ = value;
    this.saveToServer();
  }

  get time() {
    return this.time_;
  }

  set time(value) {
    this.time_ = value;
    this.saveToServer();
  }

  updateFromAPI(apiData) {
    console.assert(this.name === apiData.name);
    this.url = apiData.url;
    this.active_ = apiData.active;
    this.time_ = apiData.time;
  }

  saveToServer() {
    return fetch('/admin/update',
        {
          method: 'post',
          body: JSON.stringify({items: [this]}),
        })
  }

  toJSON() {
    return {
      'name': this.name,
      'active': this.active,
      'time': this.time,
    }
  }

  static fromAPI(apiData) {
    return new Item(apiData.name, apiData.url, apiData.active, apiData.time);
  }
}


var createTemplate = function(tmpl) {
  var ele = null;
  var elementName = tmpl[0];
  let elementAttrs = tmpl[1];
  var i = 0;
  if (typeof elementName === 'string' && elementName !== '#text') {
    i++;
    ele = document.createElement(elementName);
    if (Object.prototype.toString.call(elementAttrs) === '[object Object]') {
      i++;
      if (elementAttrs) {
        for (var prop in elementAttrs) {
          if (typeof elementAttrs[prop] === 'string') {
            ele.setAttribute(prop, elementAttrs[prop]);
          }
        }
      }
    }
  } else {
    if (elementName === '#text') {
      i++;
    }

    ele = document.createDocumentFragment();
  }
  for (; i < tmpl.length; i++) {
    if (typeof tmpl[i] === 'string') {
      ele.appendChild(document.createTextNode(tmpl[i]));
    } else if (tmpl[i]) {
      ele.appendChild(createTemplate(tmpl[i]));
    }
  }

  return ele;
};
