import Ajax from "Ajax.js"

const URL_PREFIX = 'https://api.twitch.tv/kraken';
const STREAMS_URL_INFIX = '/streams?limit=100&channel='

const MAX_ATTEMPTS = 3
const RETRY_DELAY = 5000

const HEADERS = {
	'Accept': 'application/vnd.twitchtv.v3+json',
	'Client-ID': 'hnzyrxuyox1bl31z4hid4c2igs750aq'
}

class Updater {
	sendRequest() {
		this.request = Ajax(this.getUrl())
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
			this.errorCallback(statusCode)
		}

		response = JSON.parse(response)

		this.updateResult(response.follows)

		if (this.isFinished(response)) {
			return this.finishCallback(this.result)
		}

		this.offset += 100

		this.sendRequest()
	}
}

export class FollowsUpdater extends Updater {
	constructor(username, finishCallback, errorCallback) {
		this.baseUrl = `${API_BASE_URL}/users/${username}/follows/channels?limit=100&offset=`

		this.finishCallback = finishCallback
		this.errorCallback = errorCallback

		this.start()

		return this
	}

	url() {
		return this.baseUrl + this.offset
	}

	isFinished(response) {
		return this.offset >= response._total
	}

	updateResult(response) {
		this.result = this.result.concat(response.follows)
	}
}

export class StreamsUpdater extends Updater {
	baseUrl = API_BASE_URL + STREAMS_URL_INFIX

	constructor(channels, finishCallback, errorCallback) {
		this.channels = channels

		this.finishCallback = finishCallback
		this.errorCallback = errorCallback

		this.start()

		return this
	}

	url() {
		let channels = this.channels.slice(this.offset, 100)

		return this.baseUrl + channels.join(',')
	}

	isFinished() {
		return this.offset >= this.channels.length
	}

	updateResult(response) {
		this.result = this.result.concat(response.streams)
	}
}
