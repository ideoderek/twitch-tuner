const DEPENDENCIES = ['store', 'browser', 'channels', 'notifier', 'FollowsUpdater', 'StreamsUpdater']
const UPDATE_INTERVAL = 1000 * 60 * 5
const USERNAME_KEY = 'Username'

export default class TwitchTuner {
	// Public interface

	constructor(dependencies) {
		this.bindDependencies(dependencies)

		this.username = null
		this.validUsername = true

		this.updating = false
		this.updatedAt = null

		this.updater = null
		this.timer = null
	}

	configure(settings) {
		this.store.fill(settings)
	}

	initialize() {
		let username = this.store.get(USERNAME_KEY)

		this.setUsername(username)
	}

	getStorage() {
		return this.store
	}

	getChannelContainer() {
		return this.channels
	}

	getData() {
		return {
			username: this.username,
			updating: this.updating,
			updatedAt: this.updatedAt,
			validUsername: this.validUsername
		}
	}

	openGame(gameName, active) {
		let url = 'https://twitch.tv/directory/game/' + gameName

		this.browser.open(url, active)
	}

	openStream(channelName, active) {
		let url = 'https://twitch.tv/' + channelName

		this.browser.open(url, active)
	}

	openChannel(channelName, active) {
		let url = 'https://twitch.tv/' + channelName + '/videos/all'

		this.browser.open(url, active)
	}

	openOptions() {
		this.browser.openOptions()
	}

	update() {
		this.unscheduleUpdate()
		this.cancelUpdate()

		if (! this.validUsername) {
			return
		}

		this.updating = true
		this.alert({updating: true})

		this.updateFollows()
	}

	setUsername(username) {
		if (username === this.username && this.username !== null) {
			return
		}

		if (this.validateUsername(username)) {
			this.username = username
			this.validUsername = true
			this.store.set(USERNAME_KEY, this.username)
		}
		else {
			this.username = null
			this.validUsername = false
			this.updatedAt = null
			this.warn()
		}

		this.alert({
			username: this.username,
			validUsername: this.validUsername,
			updatedAt: this.updatedAt
		})

		this.resetChannels()

		this.update()
	}

	// Private interface

	bindDependencies(dependencies) {
		for (let i in DEPENDENCIES) {
			let dependency =  DEPENDENCIES[i]

			if (! (dependency in dependencies)) {
				throw 'Missing dependency in TwitchTuner: ' + dependency
			}

			this[dependency] = dependencies[dependency]
		}
	}

	updateFollows() {
		this.updater = new this.FollowsUpdater(
			this.username,
			this.completeFollowsUpdate.bind(this),
			this.failFollowsUpdate.bind(this)
		)
	}

	completeFollowsUpdate(follows) {
		this.updater = null

		this.channels.updateChannels(follows)

		this.alert({channels: null})

		this.updateStreams()
	}

	failFollowsUpdate(status) {
		this.failUpdate()

		if (status === 404) {
			this.validUsername = false
			this.alert({validUsername: false})
			this.warn()
		}
		else {
			this.scheduleUpdate()
		}
	}

	updateStreams() {
		this.updater = new this.StreamsUpdater(
			this.channels.getChannelNames(),
			this.completeStreamsUpdate.bind(this),
			this.failStreamsUpdate.bind(this)
		)
	}

	completeStreamsUpdate(streams) {
		this.updater = null

		this.channels.updateStreams(streams)

		this.alert({streams: null})

		this.completeUpdate()
	}

	failStreamsUpdate() {
		this.failUpdate()

		this.scheduleUpdate()
	}

	failUpdate() {
		this.updater = null

		this.updating = false
		this.alert({updating: false})
	}

	completeUpdate() {
		this.updatedAt = (new Date()).valueOf()
		this.updating = false

		this.alert({
			updating: this.updating,
			updatedAt: this.updatedAt
		})

		this.notify()

		this.scheduleUpdate()
	}

	notify() {
		this.notifier.update(this.channels)
	}

	validateUsername(username) {
		return typeof username === 'string' && username.length > 0
	}

	warn() {
		this.notifier.warn()
	}

	alert(payload) {
		this.browser.sendMessage(payload)
	}

	resetChannels() {
		this.channels.clear()

		this.alert({
			channels: null,
			streams: null
		})
	}

	scheduleUpdate() {
		this.timer = setTimeout(this.update.bind(this), UPDATE_INTERVAL)
	}

	unscheduleUpdate() {
		clearTimeout(this.timer)

		this.timer = null
	}

	cancelUpdate() {
		if (this.updater === null) {
			return
		}

		this.updater.abort()

		this.updater = null
	}
}
