import Storage from "./Storage.js"
import ChannelContainer from "./ChannelContainer.js"
import Notifier from "./Notifier.js"
import Browser from "./Browser.js"
import {FollowsUpdater, StreamsUpdater} from "./Updaters.js"
import DEFAULT_SETTINGS from "./default-settings.js"

const UPDATE_INTERVAL = 1000 * 60 * 5

export {TwitchTuner as default}

let TwitchTuner = (function() {
	let store = new Storage()
	let browser = new Browser()
	let channels = new ChannelContainer(store)
	let notifier = new Notifier(store, browser)

	let exports = {
		username: null,
		validUsername: true,

		updating: false,
		updatedAt: null,

		updater: null,
		timer: null
	};

	exports.getStorage = function() {
		return store
	}

	exports.getData = function() {
		return {
			username: this.username,
			updating: this.updating,
			updatedAt: this.updatedAt,
			validUsername: this.validUsername
		};
	};

	exports.getChannelsContainer = function() {
		return channels;
	};

	exports.warn = function() {
		browser.badge(' ? ', '#FF0000');
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

		store.set('Username', this.username);

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
		browser.open('https://twitch.tv/directory/game/' + gameName);
	};

	exports.openStream = function(channelName) {
		browser.open('https://twitch.tv/' + channelName);
	};

	exports.openChannel = function(channelName) {
		browser.open('https://twitch.tv/' + channelName + '/videos/all');
	};

	exports.openOptions= function() {
		browser.openOptions();
	};

	exports.notify = function(key, value) {
		let message = typeof key === 'string' ? {key: value} : key;

		chrome.runtime.sendMessage(message);
	};

	exports.init = function() {
		store.fill(DEFAULT_SETTINGS)

		let username = store.get('Username');

		if (this.validateUsername(username)) {
			this.username = username;
		}

		this.update();
	};

	exports.resetChannels = function() {
		channels.clear();

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

		this.updating = true;
		this.notify({updating: true});

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
		this.updater = null;

		channels.updateChannels(follows);

		this.notify({
			channels: null,
			streams: null
		});

		this.updateStreams();
	};

	exports.failFollowsUpdate = function(status) {
		this.updater = null;
		this.updating = false;
		this.notify({updating: false});

		if (status === 404) {
			this.validUsername = false;
			this.notify({validUsername: false});
			this.warn();
		}
		else {
			this.queueUpdate();
		}
	};

	exports.updateStreams = function() {
		let channelNames = channels.getChannelNames();

		this.updater = new StreamsUpdater(
			channelNames,
			this.completeStreamsUpdate.bind(this),
			this.failStreamsUpdate.bind(this)
		);
	};

	exports.completeStreamsUpdate = function(streams) {
		this.updater = null;

		channels.updateStreams(streams);

		notifier.update(channels);

		this.notify({
			streams: null
		});

		this.completeUpdate();
	};

	exports.failStreamsUpdate = function() {
		this.updater = null;
		this.updating = false;
		this.notify({updating: false});

		this.queueUpdate();
	};

	exports.completeUpdate = function() {
		this.updatedAt = (new Date()).valueOf();
		this.updating = false;

		this.notify({
			updating: this.updating,
			updatedAt: this.updatedAt
		});

		this.queueUpdate();
	};

	exports.queueUpdate = function() {
		this.timer = setTimeout(this.update.bind(this), UPDATE_INTERVAL);
	};

	exports.init();

	return exports;
})();