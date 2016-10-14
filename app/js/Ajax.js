var Ajax = (function() {
	function AjaxRequest(url) {
		if (typeof url === 'string') {
			this.url = url;
		}

		this.headers = {};
		this.request = new XMLHttpRequest();
		this.request.onerror = this.onerror.bind(this);

		return this;
	}

	AjaxRequest.prototype.timeout = 5000;
	AjaxRequest.prototype.retries = 3;
	AjaxRequest.prototype.delay = 1000;

	AjaxRequest.prototype.onerror = function() {
		console.warn('AjaxRequest.onerror [retries:', this.retries, ']');
		if (this.retries === 0) {
			this.failure();
		}
		else {
			this.retries -= 1;

			this.retry = setTimeout(this.resend.bind(this), this.delay);
		}
	};

	AjaxRequest.prototype.url = function(url) {
	    this.url = url;

		return this;
	};

	AjaxRequest.prototype.header = function(name, value) {
		this.headers[name] = value;

		return this;
	};

	AjaxRequest.prototype.success = function(callback) {
		var request = this.request;

		request.onload = function() {
			callback(request.status, request.responseText);
		};

		return this;
	};

	AjaxRequest.prototype.failure = function(callback) {
		this.failure = callback;

		return this;
	};

	AjaxRequest.prototype.send = function() {
		this.request.open(this.method, this.url);

		for (var name in this.headers) {
			this.request.setRequestHeader(name, this.headers[name]);
		}

		this.request.timeout = this.timeout;
		this.request.ontimeout = this.onerror.bind(this);

		this.request.send();

		return this;
	};

	AjaxRequest.prototype.resend = function() {
	    this.request.abort();

		this.send();
	};

	AjaxRequest.prototype.get = function() {
		this.method = 'GET';

		this.send();
	};

	AjaxRequest.prototype.abort = function() {
	    this.request.abort();

		if (this.retry !== undefined) {
			clearTimeout(this.retry);
		}
	};

	return function(url) {
		return new AjaxRequest(url);
	};
})();