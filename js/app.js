'use strict';

class ItemManager extends Map {
  updateData() {
    var self = this;
    return fetch('/data.json')
      .then(function(response) { return response.json() })
      .then(function(data) { return self.updateFromAPIData_(data.items) });
  }

  updateFromAPIData_(items) {
    for (let itemData of items) {
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
    //  .filter(entry => entry[1].active)
    //  .map(entry => entry[0]);
      .filter(function(entry) { return entry[1].active })
      .map(function(entry) { return entry[0] });
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


/*! https://mths.be/array-from v0.2.0 by @mathias */
if (!Array.from) {
    (function() {
        'use strict';
        var defineProperty = (function() {
            // IE 8 only supports `Object.defineProperty` on DOM elements.
            try {
                var object = {};
                var $defineProperty = Object.defineProperty;
                var result = $defineProperty(object, object, object) && $defineProperty;
            } catch(error) {}
            return result || function put(object, key, descriptor) {
                object[key] = descriptor.value;
            };
        }());
        var toStr = Object.prototype.toString;
        var isCallable = function(fn) {
            // In a perfect world, the `typeof` check would be sufficient. However,
            // in Chrome 1–12, `typeof /x/ == 'object'`, and in IE 6–8
            // `typeof alert == 'object'` and similar for other host objects.
            return typeof fn == 'function' || toStr.call(fn) == '[object Function]';
        };
        var toInteger = function(value) {
            var number = Number(value);
            if (isNaN(number)) {
                return 0;
            }
            if (number == 0 || !isFinite(number)) {
                return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };
        var from = function(arrayLike) {
            var C = this;
            if (arrayLike == null) {
                throw new TypeError('`Array.from` requires an array-like object, not `null` or `undefined`');
            }
            var items = Object(arrayLike);
            var mapping = arguments.length > 1;

            var mapFn, T;
            if (arguments.length > 1) {
                mapFn = arguments[1];
                if (!isCallable(mapFn)) {
                    throw new TypeError('When provided, the second argument to `Array.from` must be a function');
                }
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            var len = toLength(items.length);
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue, mappedValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    mappedValue = typeof T == 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    mappedValue = kValue;
                }
                defineProperty(A, k, {
                    'value': mappedValue,
                    'configurable': true,
                    'enumerable': true,
                    'writable': true
                });
                ++k;
            }
            A.length = len;
            return A;
        };
        defineProperty(Array, 'from', {
            'value': from,
            'configurable': true,
            'writable': true
        });
    }());
}
