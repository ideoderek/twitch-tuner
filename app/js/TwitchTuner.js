var TwitchTuner = (function() {
	var Channels = new ChannelContainer();

	var exports = {
		username: null,
		validUsername: true,

		updating: false,
		updatedAt: null,

		updater: null,
		timer: null
	};

	exports.getData = function() {
		return {
			username: this.username,
			updating: this.updating,
			updatedAt: this.updatedAt,
			validUsername: this.validUsername
		};
	};

	exports.getChannelsContainer = function() {
		return Channels;
	};

	exports.warn = function() {
		Browser.badge(' ? ', '#FF0000');
	};

	exports.validateUsername = function(username) {
		if (typeof username === 'string' && username.length > 0) {
			return true;
		}

		this.warn();

		return false;
	};

	exports.setUsername = function(username) {
		if (username === this.username) {
			return;
		}

		if (this.validateUsername(username)) {
			this.username = username;
		}
		else {
			this.username = null;
		}

		Storage.set('Username', this.username);

		this.validUsername = true;
		this.updatedAt = null;
		this.notify({
			username: this.username,
			validUsername: true,
			updatedAt: null
		});

		this.resetChannels();

		this.update();
	};

	exports.openGame = function(gameName) {
		Browser.open('https://twitch.tv/directory/game/' + gameName);
	};

	exports.openStream = function(channelName) {
		Browser.open('https://twitch.tv/' + channelName);
	};

	exports.openChannel = function(channelName) {
		Browser.open('https://twitch.tv/' + channelName + '/profile');
	};

	exports.openOptions= function() {
		Browser.openOptions();
	};

	exports.notify = function(key, value) {
		var message = typeof key === 'string' ? {key: value} : key;

		chrome.runtime.sendMessage(message);
	};

	exports.init = function() {
		var username = Storage.get('Username');

		if (this.validateUsername(username)) {
			this.username = username;
		}

		// Clear the badge so the previous stream count isn't displayed
		Browser.badge('');

		this.update();
	};

	exports.resetChannels = function() {
		Channels.reset();

		this.notify({
			channels: null,
			streams: null
		});
	};

	exports.cancelUpdate = function() {
		if (this.updater === null) {
			return;
		}

		this.updater.abort();

		this.updater = null;
	};

	exports.update = function() {
		clearTimeout(this.timer);

		if (! this.validateUsername(this.username)) {
			return;
		}

		this.cancelUpdate();
		console.groupEnd();
		this.updating = true;
		this.notify({updating: true});

		console.group('Updating');
		this.updateFollows(this.username);
	};

	exports.updateFollows = function(username) {
		this.updater = new FollowsUpdater(
			username,
			this.completeFollowsUpdate.bind(this),
			this.failFollowsUpdate.bind(this)
		);
	};

	exports.completeFollowsUpdate = function(follows) {
		console.groupEnd();
		this.updater = null;
console.time('Channels.updateChannels');
		Channels.updateChannels(follows);
console.timeEnd('Channels.updateChannels');

		this.notify({
			channels: null,
			streams: null
		});

		this.updateStreams();
	};

	exports.failFollowsUpdate = function(status) {
		console.groupEnd();
		console.warn('failFollowsUpdate');
		this.updater = null;
		this.updating = false;
		this.notify({updating: false});

		if (status === 404) {
			this.validUsername = false;
			this.notify({validUsername: false});
			this.warn();
		}
		else {
			this.timer = setTimeout(this.update.bind(this), 1000 * 10);
		}
	};

	exports.updateStreams = function() {
		var channels = Channels.getChannelNames();

		this.updater = new StreamsUpdater(
			channels,
			this.completeStreamsUpdate.bind(this),
			this.failStreamsUpdate.bind(this)
		);
	};

	exports.completeStreamsUpdate = function(streams) {
		console.groupEnd();
		this.updater = null;
console.time('Channels.updateStreams');
		Channels.updateStreams(streams);
console.timeEnd('Channels.updateStreams');

		Notifier(Channels);

		this.notify({
			streams: null
		});

		this.completeUpdate();
	};

	exports.failStreamsUpdate = function() {
		console.groupEnd();
		console.warn('failStreamsUpdate');

		this.updater = null;
		this.updating = false;
		this.notify({updating: false});

		this.timer = setTimeout(this.updateStreams.bind(this), 1000 * 3);
	};

	exports.completeUpdate = function() {
		console.groupEnd();

		this.updatedAt = (new Date()).valueOf();
		this.updating = false;

		this.notify({
			updating: this.updating,
			updatedAt: this.updatedAt
		});

		this.timer = setTimeout(this.update.bind(this), 1000 * 60 * 5);
	};

	exports.debug = function(type, test) {
		switch(type) {
			case 'streams':
				this.debugStreams(test);
				break;
			case 'channels':
				this.debugChannels(test);
				break;
			case 'updating':
				this.debugUpdating(test);
				break;
		}
	};

	exports.debugChannels = function(test) {
		switch(test) {
			case 'empty':
				Channels.channelNames = [];
				Channels.channels = {};
				console.log('Channels emptied');
				break;
			case 'view':
				console.log(Channels);
				break;
		}
	};

	exports.debugStreams = function(test) {
		switch(test) {
			case 'empty':
				Channels.live = [];
				Channels.streams = {};
				console.log('Streams emptied');
				break;
			case 'view':
				console.log(Channels);
				break;
		}
	};

	exports.debugUpdating = function(seconds) {
		this.notify({updating: true});

		window.setTimeout(function() {
			exports.notify({updating: false});
		}, seconds * 1000);
	};

	exports.init();

	return exports;
})();