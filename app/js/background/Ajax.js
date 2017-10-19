const TIMEOUT = 5000
const RETRIES = 3
const DELAY = 1000

function errorHandler() {
	if (this.retries === RETRIES) {
		this.failure()
	}
	else {
		this.retries += 1

		this.retry = setTimeout(this.resend.bind(this), DELAY)
	}
}

class AjaxRequest {
	constructor(url) {
		this.url = url

		this.retries = 0

		this.headers = {}
		this.request = new XMLHttpRequest()
		this.request.onerror = errorHandler.bind(this)
	}

	get() {
		this.method = 'GET'

		this.send()
	}

	header(name, value) {
		this.headers[name] = value

		return this
	}

	success(callback) {
		let request = this.request

		request.onload = () => {
			callback(request.status, request.responseText)
		}

		return this
	}

	failure(callback) {
		this.failure = callback

		return this
	}

	send() {
		this.setupRequest()

		this.request.send()
	}

	setupRequest() {
		this.request.open(this.method, this.url)

		this.attachHeaders()

		this.request.timeout = TIMEOUT
		this.request.ontimeout = this.request.onerror
	}

	attachHeaders() {
		for (let name in this.headers) {
			this.request.setRequestHeader(name, this.headers[name])
		}
	}

	resend() {
	    this.abort()

		this.send()
	}

	abort() {
		if (this.retry !== undefined) {
			clearTimeout(this.retry)
		}

		this.request.abort()
	}
}

export function Ajax(url) {
	return new AjaxRequest(url)
}
