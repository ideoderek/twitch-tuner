(function(global) {
	var API_BASE_URL = 'https://api.twitch.tv/kraken';

	var TwitchRequest = function(url) {
		return Ajax(url)
			.header('Accept', 'application/vnd.twitchtv.v3+json')
			.header('Client-ID', 'hnzyrxuyox1bl31z4hid4c2igs750aq');
	};

	global.FollowsUpdater = (function() {
		function Updater(username, onSuccess, onFailure) {
			console.groupCollapsed('Updating follows');
			this.baseUrl = API_BASE_URL + '/users/' + username + '/follows/channels?limit=100&offset=';
			this.succeed = onSuccess;
			this.fail = onFailure;

			this.start();

			return this;
		}

		Updater.prototype.start = function() {
			this.total = null;
			this.offset = 0;
			this.result = [];

			this.request();
		};

		Updater.prototype.getUrl = function() {
			var url = this.baseUrl + this.offset;

			this.offset += 100;

			return url;
		};

		Updater.prototype.request = function() {
			this.currentRequest = TwitchRequest(this.getUrl())
				.success(this.parse.bind(this))
				.failure(this.fail.bind(this));

			this.currentRequest.get();

			console.log(this.currentRequest);
		};

		Updater.prototype.parse = function(status, response) {
			console.log('API response status code: ' + status);

			if (status !== 200) {
				return this.fail(status);
			}

			response = JSON.parse(response);

			if (this.changed(response)) {
				console.log('Total number of follows changed, restarting update.');
				return this.start();
			}

			this.updateResult(response.follows);

			if (this.finished()) {
				console.log('Complete');
				console.groupEnd();
				return this.succeed(this.result);
			}

			this.request();
		};

		Updater.prototype.changed = function(current) {
			// The only way to truly verify that follows have not changed
			// between requests is to repeat the first request at the end.
			// Not worth it.
			if (this.total === null) {
				this.total = current._total;
				console.log('Changed this.total to:', this.total);
			}
			else if (this.total !== current._total) {
				return true;
			}

			return false;
		};

		Updater.prototype.finished = function() {
			if (this.offset >= this.total) {
				return true;
			}

			return false;
		};

		Updater.prototype.updateResult = function(follows) {
			this.result = this.result.concat(follows);
			console.log('Updated result:', this.result);
		};

		Updater.prototype.abort = function() {
			console.groupEnd();
			this.currentRequest.abort();
		};

		return Updater;
	})();

	global.StreamsUpdater = (function() {
		function Updater(channels, onSuccess, onFailure) {
			console.groupCollapsed('Updating streams');
			this.channels = channels.slice();
			this.succeed = onSuccess;
			this.fail = onFailure;

			this.start();

			return this;
		}

		Updater.prototype.baseUrl = API_BASE_URL + '/streams?limit=100&channel=';

		Updater.prototype.getUrl = function() {
			var channels = this.channels.splice(0, 100);

			return this.baseUrl + channels.join(',');
		};

		Updater.prototype.start = function() {
			this.result = [];

			this.request();
		};

		Updater.prototype.request = function() {
			this.currentRequest = TwitchRequest(this.getUrl())
				.success(this.parse.bind(this))
				.failure(this.handleRequestError.bind(this));

			this.currentRequest.get();
		};

		Updater.prototype.parse = function(status, response) {
			console.log('API response status code:', status);
			if (status !== 200) {
				return this.fail(status, this.result);
			}

			response = JSON.parse(response);

			this.updateResult(response.streams);

			if (this.channels.length === 0) {
				console.log('Complete');
				console.groupEnd();
				return this.succeed(this.result);
			}

			this.request();
		};

		Updater.prototype.updateResult = function(streams) {
			this.result = this.result.concat(streams);
			console.log('Updated result:', this.result);
		};

		Updater.prototype.handleRequestError = function() {
			this.fail(this.result);
		};

		Updater.prototype.abort = function() {
			console.groupEnd();
			this.currentRequest.abort();
		};

		return Updater;
	})();
})(window);
