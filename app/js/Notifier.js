var Notifier = function(Storage, Browser) {
	var q = {
		check: function(name, then) {
			if (Storage.get(name) === true) {
				return true;
			}

			return false;
		},
		get badgeEnabled() {
			return this.check('Badge_Enabled');
		},
		get notificationsEnabled() {
			return this.check('Notifications_Enabled');
		},
		get showGame() {
			return this.check('Notifications_ShowGame');
		},
		get showViewers() {
			return this.check('Notifications_ShowViewers');
		},
		get showDescription() {
			return this.check('Notifications_ShowDescription');
		},
		get favoritesOnly() {
			return this.check('Notifications_FavoritesOnly');
		},
	};

	Storage.listen('Badge_Enabled', updateBadge)

	var liveChannels = [],
		count = 0;

	var commonOptions = function() {
		return {
			isClickable: true,
			iconUrl: '../img/icon128.png',
			title: '',
			message: ''
		};
	};

	var generateId = (function() {
		var id = 0;

		return function() {
			return String(id++);
		};
	})();

	function getTitle(stream) {
		return stream.displayName + ' is live!';
	}

	function getMessage(stream) {
		var message = [];

		if (q.showGame && stream.game) {
			message.push(stream.game);
		}

		if (q.showViewers) {
			var end = stream.formattedViewers === 1 ? 'viewer' : 'viewers';

			message.push('for ' + stream.formattedViewers + ' ' + end);
		}

		if (message.length > 0) {
			message.unshift('Playing');

			return message.join(' ');
		}

		return '';
	}

	function getContextMessage(stream) {
		if (q.showDescription) {
			return stream.description;
		}

		return '';
	}

	function getItems(streamCount, streams) {
		var items = [];

		streamCount = streamCount < 5 ? streamCount : 5;

		for (var i = 0; i < streamCount; i++) {
			var item = {},
				stream = streams[i];

			item.title = stream.displayName;

			if (q.showGame && stream.game) {
				item.message = stream.game;
			}
			else if (q.showViewers) {
				item.message = stream.formattedViewers + ' viewers';
			}
			else if (q.showDescription) {
				item.message = stream.description;
			}
			else {
				item.message = '';
			}

			items.push(item);
		}

		return items;
	}

	function createNotification(id, options) {
		Browser.notification(id, options);
	}

	function singleNotification(stream) {
		var options = commonOptions();
		options.type = 'basic';
		options.title = getTitle(stream);
		options.message = getMessage(stream);
		options.contextMessage = getContextMessage(stream);

		createNotification(stream.name, options);
	}

	function multiNotification(streams) {
		var streamCount = streams.length,
			options = commonOptions();
		options.type = 'list';
		options.title = streamCount + ' channels are now live!';

		if (streamCount > 5) {
			options.contextMessage = 'and ' + (streamCount - 5) + ' more!';
		}

		options.items = getItems(streamCount, streams);

		createNotification('multi_' + generateId(), options);
	}

	function updateBadge() {
		if (q.badgeEnabled) {
			Browser.badge(count, '#6441A5');
		}

		else {
			// This will effectively disable the badge
			Browser.badge('');
		}
	}

	function createNotifications(streams) {
		if (! q.notificationsEnabled) {
			return;
		}

		if (streams.length > 3) {
			multiNotification(streams);
		}
		else {
			streams.forEach(singleNotification);
		}
	}

	function clearNotification(id) {
		Browser.clearNotification(id);
	}

	function onNotificationClick(id) {
		if (id.indexOf('multi_') >= 0) {
			Browser.open('https://twitch.tv/directory/following/live');
		}
		else {
			Browser.open('https://twitch.tv/' + id);
		}

		clearNotification(id);
	}

	chrome.notifications.onClicked.addListener(onNotificationClick);

	function isAlertable(stream) {
		if (q.favoritesOnly && ! stream.favorite) {
			return false;
		}

		if (liveChannels.indexOf(stream.name) === -1) {
			return true;
		}

		return false;
	}

	return function(channels) {
		count = channels.countStreams();

		updateBadge();
		createNotifications(channels.filterStreams(isAlertable));

		// This has to happen after the call to createNotifications
		// or else isAlertable will always return false
		liveChannels = channels.getLiveChannelNames();
	};
}(Storage, Browser);
