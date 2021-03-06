let emptyCallback = () => {}

export default class Browser {
	open(url, active = true) {
		chrome.tabs.create({url, active})
	}

	openOptions() {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage()
		}
		else {
			this.open(chrome.runtime.getURL('options.html'))
		}
	}

	notification(id, options) {
		chrome.notifications.create(id, options, emptyCallback)
	}

	clearNotification(id) {
		chrome.notifications.clear(id, emptyCallback)
	}

	onNotificationClick(callback) {
		chrome.notifications.onClicked.addListener(callback)
	}

	badge(text, color) {
		if (color !== undefined) {
			chrome.browserAction.setBadgeBackgroundColor({ color: color })
		}

		chrome.browserAction.setBadgeText({ text: String(text) })
	}

	sendMessage(payload) {
		chrome.runtime.sendMessage(payload)
	}
}
