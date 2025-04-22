import storage from './storage'
import Config from './config'

let Setting = function Setting (config, options, key) {
    if (!this || !this.sub) {
        return new Setting(config, options, key);
    }
    this.config = Config(config);
    this.parent = null;
    this._key = this.config.resolveValue(key || '').toLowerCase();
    this._ = {};
    this.default(options || {});
};

Setting.prototype = {
    key: function (name) {
        return [this._key, name].join('.');
    },
    add: function (settings) {
        Object.keys(settings).forEach(function (name) {
            this.set(name, settings[name]);
        }, this);
    },
    default: function (settings) {
        Object.keys(settings).forEach(function (name) {
            storage.default(this.key(name), settings[name]);
            let __all = storage.get(this._key + '..all', []);
            if (__all.indexOf(name) < 0) {
                __all.push(name);
                storage.set(this._key + '..all', __all);
            }
        }, this);
    },
    set: function (name, val) {
        storage.set(this.key(name), val);
        let __all = storage.get(this._key + '..all', []);
        if (__all.indexOf(name) < 0) {
            __all.push(name);
            storage.set(this._key + '..all', __all);
        }
        return val;
    },
    get: function (name, def, type = null) {
        let result, val;
        result = val = storage.get(this.key(name), null);
        while (typeof result === 'string' && result.substr(0, 1) === '@') {
            result = val = result.substr(1);
            val = storage.get(this.key(val), null);
            if (null == val) {
                result = val = this.config.get(result, null);
            }
        }
        if (null === result && this.parent) {
            result = this.parent.get(name, null, type);
        }
        if (null === result) {
            result = this.config.get(name, def);
        }
        result = this.config.resolveValue(result);
        if (type) {
            result = type(result)
        }
        return result || def;
    },
    all: function () {
        let __all = storage.get(this._key+'..all', []),
            res = {};
        __all.forEach(function (name) {
            res[name] = this.get(name);
        }, this);
        return res;
    },
    has: function (name) {
        return storage.has(this.key(name));
    },
    remove: function (name = null) {
        let __all = storage.get(this._key + '..all', []);
        if (name) {
            __all = __all.filter((val) => val != name)
            storage.del(this.key(name));
            storage.set(this._key + '..all', __all);
        } else {
            __all.forEach((key) => {this.remove(key)});
            storage.del(this._key + '..all');
        }
    },
    sub: function (key, options, config) {
        key = String(this.config.resolveValue(key || '') || '');
        if (!this._[key.toLowerCase()]) {
            this._[key.toLowerCase()] = new Setting(config || this.config, options || {}, [this._key, key].join('.'));
            this._[key.toLowerCase()].parent = this;
        }
        return this._[key.toLowerCase()];
    }
};

Setting.prototype.constructor = Setting;

export default Setting;