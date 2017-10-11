import {DictionaryOrder as Orderer} from "./DictionaryOrder.js"
import Set from "./Set.js"

const AUTO_FAVORITE_KEY = 'Favorites_AutoByNotifications'
const FAVORITES_KEY = 'Favorites'
const CHANNEL_SORT_KEYS = ['Channels_SortAttribute', 'Channels_SortDescending', 'Channels_GroupAttribute', 'Channels_GroupDescending']
const STREAM_SORT_KEYS = ['Streams_SortAttribute', 'Streams_SortDescending', 'Streams_GroupAttribute', 'Streams_GroupDescending']

export default class ChannelContainer {
	constructor(store) {
		this.store = store

		this.configure()
		this.attachListeners()

		this.channelData = {}

		this.channels = new Orderer(this.channelData, this.getSortParameters('Channels'))
		this.streams = new Orderer(this.channelData, this.getSortParameters('Streams'))
	}

	configure() {
		let favorites = this.store.get(FAVORITES_KEY) || []
		this.favorites = new Set(favorites)

		this.autoFavorite = this.store.get(AUTO_FAVORITE_KEY)
	}

	attachListeners() {
		let autoFavoriteListener = this.setAutoFavoriting.bind(this)
		this.store.listen(AUTO_FAVORITE_KEY, autoFavoriteListener)

		let sortParameterListener = this.setSortParameter.bind(this)
		this.store.listenToKeys(CHANNEL_SORT_KEYS, sortParameterListener)
		this.store.listenToKeys(STREAM_SORT_KEYS, sortParameterListener)
	}

	setAutoFavoriting(on) {
		this.autoFavorite = on
	}

	clear() {
		this.channelData = {}

		this.channels.reset(this.channelData)
		this.streams.reset(this.channelData)
	}

	getSortParameters(type) {
		return {
			sortBy: this.store.get(type + '_SortAttribute'),
			sortDirection: this.store.get(type + '_SortDescending'),
			groupBy: this.store.get(type + '_GroupAttribute'),
			groupDirection: this.store.get(type + '_GroupDescending')
		}
	}

	setSortParameter(value, name) {
		let parameter = name.split('_')
		let descriptor = {}

		descriptor[parameter[1]] = value

		this[parameter[0].toLowerCase()].configureSorter(descriptor)
	}

	update(newData, previousKeys, updater, remover) {
		newData.forEach((obj) => {
			updater(element)

			previousKeys.splice(previousKeys.indexOf(obj.channel.name), 1)
		})

		previousKeys.forEach(remover)
	}

	updateChannels(data) {
		let updater = this.updateChannel.bind(this)
		let unfollower = this.unfollow.bind(this)

		this.update(data, this.getChannelNames(), updater, unfollower)

		this.channels.sort()
	}

	updateStreams(data) {
		let updater = this.updateStream.bind(this)
		let offliner = this.offline.bind(this)

		this.update(data, this.getLiveChannelNames(), updater, offliner)

		this.streams.sort()
	}

	updateChannel(data) {
		let channel = data.channel
		let name = channel.name

		if (! (name in this.channelData)) {
			this.channelData[name] = {}
		}

		let obj = this.channelData[name]

		this.autoFavorite(name, data.notifications)

		obj.displayName = channel.display_name
		obj.followers = channel.followers
		obj.formattedFollowers = channel.followers.toLocaleString()
		obj.favorite = this.isFavorite(name)

		this.channels.add(name)
	}

	updateStream(data) {
		let obj = this.channelData[data.channel.name]

		obj.game = data.game || null
		obj.viewers = data.viewers
		obj.formattedViewers = data.viewers.toLocaleString()
		obj.description = data.channel.status
		obj.preview = data.preview.medium

		this.streams.add(data.channel.name)
	}

	unfollow(name) {
		delete this.channelData[name]

		this.channels.remove(name)
		this.streams.remove(name)
	}

	offline(name) {
		this.streams.remove(name)

		let channel = this.channelData[name]
		delete channel.game
		delete channel.viewers
		delete channel.formattedViewers
		delete channel.description
		delete channel.preview
	}

	autoFavorite(name, notifications) {
		if (this.autoFavorite && notifications) {
			this.favorite(name, true)
		}
	}

	isFavorite(name) {
		return this.favorites.has(name)
	}

	favorite(name, favorite) {
		if (this.favorites.has(name) === favorite) {
			return
		}

		this.channelData[name].favorite = favorite

		this.channels.update(name)
		this.streams.update(name)

		this.favorites.toggle(name, favorite)
		this.store.set(FAVORITES_KEY, this.favorites.data())
	}

	countChannels() {
		return this.channels.count()
	}

	countStreams() {
		return this.streams.count()
	}

	getChannelNames() {
		return this.channels.keys()
	}

	getLiveChannelNames() {
		return this.streams.keys()
	}

	reduceChannels(reducer, value) {
		return this.channels.reduce(reducer, value)
	}

	reduceStreams(reducer, value) {
		return this.streams.reduce(reducer, value)
	}

	filterStreams() {
		return this.streams.filter.apply(this.streams, arguments)
	}

	get(name) {
		return this.channelData[name]
	}
}
