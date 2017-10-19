const BADGE_COLOR = '#6441A5'
const BADGE_WARN_TEXT = ' ? '
const BADGE_WARN_COLOR = '#FF0000'
const BADGE_ENABLED_KEY = 'Badge_Enabled'

const NOTIFICATIONS_ENABLED_KEY = 'Notifications_Enabled'
const SHOW_GAME_KEY = 'Notifications_ShowGame'
const SHOW_VIEWERS_KEY = 'Notifications_ShowViewers'
const SHOW_DESCRIPTION_KEY = 'Notifications_ShowDescription'
const FAVORITES_ONLY_KEY = 'Notifications_FavoritesOnly'

const SINGLE_ID_PREFIX = 'single_'
const MULTI_ID_PREFIX = 'multi_'
const SINGLE_CLICK_URL_PREFIX = 'https://twitch.tv/'
const MULTI_CLICK_URL = 'https://twitch.tv/directory/following/live'

var id = 0

class Notification {
	constructor(browser, store, data) {
		this.browser = browser
		this.store = store

		if (data !== undefined) {
			this.data = data

			this.spawn()
		}
	}

	options() {
		return {
			isClickable: true,
			iconUrl: '../img/icon128.png',
			type: this.type(),
			title: this.title()
		}
	}

	spawn() {
		this.browser.notification(this.id(), this.options())
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

	click(id) {
		if (id.indexOf(this.idPrefix()) === 0) {
			this.browser.open(this.clickUrl(id))

			this.browser.clearNotification(id)
		}
	}
}

class SingleNotification extends Notification {
	idPrefix() {
		return SINGLE_ID_PREFIX
	}

	id() {
		return this.idPrefix() + this.data.name
	}

	type() {
		return 'basic'
	}

	title() {
		return this.data.displayName + ' is live!'
	}

	options() {
		let options = super.options()
		let message = this.message()

		if (message === undefined) {
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
		let prefixLength = this.idPrefix().length

		return SINGLE_CLICK_URL_PREFIX + id.slice(prefixLength)
	}
}

class MultiNotification extends Notification {
	idPrefix() {
		return MULTI_ID_PREFIX
	}

	id() {
		return this.idPrefix() + String(id++)
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
		options.message = ''
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

export default class Notifier {
	constructor(Storage, Browser) {
		this.store = Storage
		this.browser = Browser

		this.streamCount = 0
		this.liveChannels = []

		this.badgeEnabled = this.store.get(BADGE_ENABLED_KEY)
		this.updateBadge()
		this.store.listen(BADGE_ENABLED_KEY, this.toggleBadge.bind(this))

		let clickListener = this.onNotificationClick.bind(this)
		this.browser.onNotificationClick(clickListener)
	}

	update(channels) {
		this.streamCount = channels.countStreams()
		this.updateBadge()

		let favoritesOnly = this.store.get(FAVORITES_ONLY_KEY) === true
		let isAlertable = this.isAlertable.bind(this, favoritesOnly)
		let alertable = channels.filterStreams(isAlertable)
		this.notify(alertable)

		this.liveChannels = channels.getLiveChannelNames()
	}

	notify(streams) {
		if (this.store.get(NOTIFICATIONS_ENABLED_KEY) === false) {
			return
		}

		if (streams.length > 3) {
			new MultiNotification(this.browser, this.store, streams)
		}
		else {
			streams.forEach((stream) => {
				new SingleNotification(this.browser, this.store, stream)
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

	warn() {
		this.browser.badge(BADGE_WARN_TEXT, BADGE_WARN_COLOR)
	}

	onNotificationClick(id) {
		let single = new SingleNotification(this.browser)
		let multi = new MultiNotification(this.browser)

		single.click(id)
		multi.click(id)
	}

	isAlertable(favoritesOnly, stream) {
		if (favoritesOnly && ! stream.favorite) {
			return false
		}

		return this.liveChannels.indexOf(stream.name) === -1
	}
}
