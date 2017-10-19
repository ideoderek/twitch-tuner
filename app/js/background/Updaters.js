import {Ajax} from "./Ajax.js"

const URL_PREFIX = 'https://api.twitch.tv/kraken'
const STREAMS_URL_INFIX = '/streams?limit=100&channel='

const HEADERS = {
	'Accept': 'application/vnd.twitchtv.v3+json',
	'Client-ID': 'hnzyrxuyox1bl31z4hid4c2igs750aq'
}

class Updater {
	constructor(finishCallback, errorCallback) {
		this.finishCallback = finishCallback
		this.errorCallback = errorCallback
	}

	sendRequest() {
		this.request = Ajax(this.url())
		this.request.success(this.parse.bind(this))
		this.request.failure(this.fail.bind(this))

		for (let key in HEADERS) {
			this.request.header(key, HEADERS[key])
		}

		this.request.get()
	}

	fail() {
		this.errorCallback(0)
	}

	abort() {
		this.request.abort()
	}

	start() {
		this.result = []
		this.offset = 0

		this.sendRequest()
	}

	parse(statusCode, response) {
		if (statusCode !== 200) {
			return this.errorCallback(statusCode)
		}

		response = JSON.parse(response)

		this.updateResult(response)

		if (this.isFinished(response)) {
			return this.finishCallback(this.result)
		}

		this.offset += 100

		this.sendRequest()
	}
}

export class FollowsUpdater extends Updater {
	constructor(username, finishCallback, errorCallback) {
		super(finishCallback, errorCallback)

		this.baseUrl = `${URL_PREFIX}/users/${username}/follows/channels?limit=100&offset=`

		this.start()

		return this
	}

	url() {
		return this.baseUrl + this.offset
	}

	isFinished(response) {
		return (this.offset + 100) > response._total
	}

	updateResult(response) {
		this.result = this.result.concat(response.follows)
	}
}

export class StreamsUpdater extends Updater {
	constructor(channels, finishCallback, errorCallback) {
		super(finishCallback, errorCallback)

		this.baseUrl = URL_PREFIX + STREAMS_URL_INFIX

		this.channels = channels

		this.start()

		return this
	}

	url() {
		let offset = this.offset
		let channels = this.channels.slice(offset, offset + 100)

		return this.baseUrl + channels.join(',')
	}

	isFinished() {
		return (this.offset + 100) > this.channels.length
	}

	updateResult(response) {
		this.result = this.result.concat(response.streams)
	}
}
