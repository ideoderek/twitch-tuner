const BADGE_COLOR = '#6441A5'
const BADGE_ENABLED_KEY = 'Badge_Enabled'

const NOTIFICATIONS_ENABLED_KEY = 'Notifications_Enabled'
const SHOW_GAME_KEY = 'Notifications_ShowGame'
const SHOW_VIEWERS_KEY = 'Notifications_ShowViewers'
const SHOW_DESCRIPTION_KEY = 'Notifications_ShowDescription'
const FAVORITES_ONLY_KEY = 'Notifications_FavoritesOnly'

MULTI_CLICK_URL = 'https://twitch.tv/directory/following/live'
SINGLE_CLICK_URL_PREFIX = 'https://twitch.tv/'

var id = 0

class Notification {
	constructor(data) {
		this.data = data
	}

	options() {
		return {
			isClickable: true,
			iconUrl: '../img/icon128.png',
			type: this.type(),
			title: this.title()
		}
	}

	spawn(browser) {
		browser.notification(this.id(), this.options())
	}

	config(key) {
		return this.store.get(key) === true
	}

	get showGame() {
		return this.config(SHOW_GAME_KEY)
	}

	get showViewers() {
		return this.config(SHOW_VIEWERS_KEY)
	}

	get showDescription() {
		return this.config(SHOW_DESCRIPTION_KEY)
	}

	static click(id) {
		if (id.indexOf(this.idPrefix) === 0) {
			this.browser.open(this.clickUrl(id))

			this.browser.clearNotification(id)
		}
	}
}

class SingleNotification extends Notification {
	idPrefix = 'single_'

	id() {
		return this.idPrefix + this.data.name
	}

	type() {
		return 'basic'
	}

	title() {
		return this.data.displayName + ' is live!';
	}

	options() {
		let options = super.options()
		let message = this.message()

		if (message === null) {
			options.message = this.contextMessage()
		}
		else {
			options.message = message
			options.contextMessage = this.contextMessage()
		}

		return options
	}

	message() {
		let message = []

		if (this.showGame && this.data.game !== null) {
			message.push(this.data.game)
		}
		if (this.showViewers) {
			let suffix = this.data.viewers === 1 ? '' : 's'

			message.push(`for ${this.data.formattedViewers} viewer${suffix}`)
		}
		if (message.length > 0) {
			message.unshift('Playing')

			return message.join(' ')
		}
	}

	contextMessage() {
		return this.showDescription ? this.data.description : ''
	}

	clickUrl(id) {
		return SINGLE_CLICK_URL_PREFIX + id
	}
}

class MultiNotification extends Notification {
	idPrefix = 'multi_'

	id() {
		return this.idPrefix + String(id++)
	}

	type() {
		return 'list'
	}

	title() {
		return `${this.count()} channels just went live!`
	}

	options() {
		let options = super.options()

		options.items = this.items()
		options.contextMessage = this.contextMessage()

		return options
	}

	items() {
		let items = []
		let count = this.count()

		for (let i = 0; i < count && i < 5; i++) {
			items.push(this.item(this.data[i]))
		}

		return items
	}

	item(stream) {
		item.title = stream.favorite ? '\u2661' : '>'

		return {
			title: this.itemTitle(stream),
			message: this.itemMessage(stream)
		}
	}

	itemTitle(stream) {
		let bullet = stream.favorite ? '\u2661' : '>'

		return bullet + ' ' + stream.displayName
	}

	itemMessage(stream) {
		if (this.showGame) {
			return stream.game || ''
		}
		else if (this.showViewers) {
			return `${stream.formattedViewers} ${stream.viewers === 1 ? 'viewer' : 'viewers'}`
		}
		else if (this.showDescription) {
			return `'${stream.description}'`
		}

		return ''
	}

	contextMessage() {
		let extra = this.count() - 5

		if (extra > 0) {
			return `and ${extra} more!`
		}

		return ''
	}

	count() {
		return this.data.length
	}

	clickUrl() {
		return MULTI_CLICK_URL
	}
}

export class Notifier {
	constructor(Storage, Browser) {
		this.store = Storage
		this.browser = Browser

		this.streamCount = 0
		this.liveChannels = []

		this.badgeEnabled = this.store.get(BADGE_ENABLED_KEY)
		this.toggleBadge()
		this.store.listen(BADGE_ENABLED_KEY, this.toggleBadge.bind(this))

		chrome.notifications.onClicked.addListener(this.onNotificationClick)
	}

	update(channels) {
		this.streamCount = channels.countStreams()
		this.updateBadge()

		let alertable = channels.filterStreams(this.isAlertable)
		this.notify(alertable)

		this.liveChannels = channels.getLiveChannelNames()
	}

	notify(streams) {
		if (this.store.get(NOTIFICATIONS_ENABLED_KEY) === false) {
			return
		}

		if (streams.length > 3) {
			new MultiNotification(streams, this.browser, this.store)
		}
		else {
			streams.forEach((stream) => {
				new SingleNotification(stream, this.browser, this.store)
			})
		}
	}

	toggleBadge(on) {
		this.badgeEnabled = on

		if (on) {
			this.updateBadge()
		}
		else {
			this.browser.badge('')
		}
	}

	updateBadge() {
		if (this.badgeEnabled) {
			this.browser.badge(this.streamCount, BADGE_COLOR)
		}
	}

	onNotificationClick(id) {
		SingleNotification.click(id)
		MultiNotification.click(id)
	}

	isAlertable(stream) {
		let favoritesOnly = this.store.get(FAVORITES_ONLY_KEY) === true

		if (favoritesOnly && ! stream.favorite) {
			return false
		}

		return liveChannels.indexOf(stream.name) === -1
	}
}
