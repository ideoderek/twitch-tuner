var Notifier = function(Config) {
	var emptyCallback = function() {},
		notificationsEnabled = Config.get('Notifications_Enabled'),
		badgeEnabled = Config.get('Badge_Enabled'),
		showGame = Config.get('Notifications_ShowGame'),
		showViewers = Config.get('Notifications_ShowViewers'),
		showDescription = Config.get('Notifications_ShowDescription'),
		favoritesOnly = Config.get('Notifications_FavoritesOnly');

	var liveChannels = [];

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

		if (showGame && stream.game) {
			message.push(stream.game);
		}

		if (showViewers) {
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
		if (showDescription) {
			return stream.description;
		}

		return '';
	}

	function getItems(count, streams) {
		var items = [];

		count = count < 5 ? count : 5;

		for (var i = 0; i < count; i++) {
			var item = {},
				stream = streams[i];

			item.title = stream.displayName;

			if (showGame && stream.game) {
				item.message = stream.game;
			}
			else if (showViewers) {
				item.message = stream.formattedViewers + ' viewers';
			}
			else if (showDescription) {
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

	function multiNotification(count, streams) {
		var options = commonOptions();
		options.type = 'list';
		options.title = count + ' channels are now live!';

		if (count > 5) {
			options.contextMessage = 'and ' + (count - 5) + ' more!';
		}

		options.items = getItems(count, streams);

		createNotification('multi_' + generateId(), options);
	}

	function updateBadge(count) {
		if (! badgeEnabled) {
			return;
		}

		Browser.badge(count, '#6441A5');
	}

	function createNotifications(count, streams) {
		if (! notificationsEnabled || count === 0) {
			return;
		}

		if (count > 3) {
			multiNotification(count, streams);
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
		if (favoritesOnly && ! stream.favorite) {
			return false;
		}

		if (liveChannels.indexOf(stream.name) === -1) {
			return true;
		}

		return false;
	}

	return function(Channels) {
		var count = Channels.countStreams();
		updateBadge(count);

		var streams = Channels.filterStreams(isAlertable);
		createNotifications(streams.length, streams);

		liveChannels = Channels.streams.keys();
	};
}(Storage);
