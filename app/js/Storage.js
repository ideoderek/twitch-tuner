var Storage = {
	values: Browser.storage.all(),
	listeners: {},
	init: function() {
		this.values = Browser.storage.all();

		this.listeners = {};
	},
	set: function(key, value) {
		if (typeof key === 'string') {
			this.values[key] = value;

			Browser.storage.set(key, value);

			this.notify(key, value);

			return;
		}

		for (var i in key) {
			this.set(i, key[i]);
		}
	},
	fill: function(key, value) {
		if (typeof key === 'string') {
			if (! this.has(key)) {
				this.set(key, value);
			}

			return;
		}

		for (var i in key) {
			this.fill(i, key[i]);
		}
	},
	get: function(keys, listener) {
		if (typeof keys === 'string') {
			this.listen(keys, listener);

			return keys in this.values ? this.values[keys] : null;
		}

		var keyValuePairs = {};

		for (var i in keys) {
			var key = keys[i];
			keyValuePairs[key] = this.get(key, listener);
		}

		return keyValuePairs;
	},
	all: function() {
		return this.values;
	},
	has: function(keys) {
		if (typeof keys === 'string') {
			return keys in this.values;
		}

		for (var i in keys) {
			if (! this.has(keys[i])) {
				return false;
			}
		}

		return true;
	},
	clear: function() {
		this.values = {};

		Browser.storage.clear();
	},
	remove: function(keys) {
		if (typeof keys === 'string') {
			delete this.values[keys];

			Browser.storage.remove(keys);

			return;
		}

		for (var i in keys) {
			this.remove(keys[i]);
		}
	},
	listen: function(key, listener) {
		if (typeof listener !== 'function') {
			return;
		}

		if (! (key in this.listeners)) {
			this.listeners[key] = [listener];
		}
		else {
			this.listeners[key].push([listener]);
		}
	},
	notifiable: function(key) {
		if (! (key in this.listeners) || ! (0 in this.listeners[key])) {
			return false;
		}

		if (typeof this.listeners[key][0] === 'function') {
			return true;
		}

		return false;
	},
	notify: function(key, value) {
		if (! this.notifiable(key)) {
			return;
		}

		var listeners = this.listeners[key];
		for (var i in listeners) {
			listeners[i](value, key);
		}
	}
};
