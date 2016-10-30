var Browser = (function() {
	var exports = {};

	var emptyCallback = function(){};

	exports.storage = {
		get: function(key) {
			var value;

			try {
				value = JSON.parse(localStorage.getItem(key));
			}
			catch (e) {
				value = null;
			}

			return value;
		},
		all: function() {
			var values = {},
				length = localStorage.length;

			for (var i = 0; i < length; i++) {
				var key = localStorage.key(i);

				values[key] = this.get(key);
			}

			return values;
		},
		set: function(key, value) {
			localStorage.setItem(key, JSON.stringify(value));
		},
		remove: function(key) {
			localStorage.removeItem(key);
		},
		clear: function() {
			localStorage.clear();
		}
	};

	exports.open = function(url) {
		chrome.tabs.create({url: url});
	};

	exports.openOptions = function() {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			this.open(chrome.runtime.getURL('options.html'));
		}
	};

	exports.notification = function(id, options) {
		chrome.notifications.create(id, options, emptyCallback);
	};

	exports.clearNotification = function(id) {
		chrome.notifications.clear(id, emptyCallback);
	};

	exports.badge = function(text, color) {
		if (color !== undefined) {
			chrome.browserAction.setBadgeBackgroundColor({ color: color });
		}

		chrome.browserAction.setBadgeText({ text: String(text) });
	};

	return exports;
})();
