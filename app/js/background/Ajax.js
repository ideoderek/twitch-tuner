function errorHandler() {
	if (this.retries === 0) {
		this.failure();
	}
	else {
		this.retries -= 1;

		this.retry = setTimeout(this.resend.bind(this), this.delay);
	}
}

class AjaxRequest {
	timeout = 5000
	retries = 3
	delay = 1000

	constructor(url) {
		this.url = url

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

		this.request.timeout = this.timeout
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
