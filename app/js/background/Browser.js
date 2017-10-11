export {Browser as default}

let emptyCallback = () => {}

let Browser = {
	open: function(url) {
		chrome.tabs.create({url: url})
	},

	openOptions: function() {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage()
		}
		else {
			this.open(chrome.runtime.getURL('options.html'))
		}
	},

	notification: function(id, options) {
		chrome.notifications.create(id, options, emptyCallback);
	},

	clearNotification: function(id) {
		chrome.notifications.clear(id, emptyCallback)
	},

	badge: function(text, color) {
		if (color !== undefined) {
			chrome.browserAction.setBadgeBackgroundColor({ color: color })
		}

		chrome.browserAction.setBadgeText({ text: String(text) })
	},
}
