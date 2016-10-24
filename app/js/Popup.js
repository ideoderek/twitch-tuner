(function() {
	var TwitchTuner = chrome.extension.getBackgroundPage().TwitchTuner,
		Channels = TwitchTuner.getChannelsContainer(),
		data;

	/* Timer */
	var updateTimer = (function() {
		var display = document.getElementById('time_display'),
			button = document.getElementById('reload_button'),
			timeoutID;

		button.onclick = function() {
			TwitchTuner.update();
		};

		function getTimeElapsed(time) {
			var elapsed = Math.floor((new Date() - time) / 60000);

			if (elapsed === 0) {
				return '< 1 minute';
			}

			if (elapsed === 1) {
				return '1 minute';
			}

			return elapsed + ' minutes';
		}

		function setLabel(text) {
			display.innerHTML = text;
		}

		function toggleUpdateIndicator(updating) {
			button.classList.toggle('updating', updating);

			if (updating) {
				setLabel('Updating . . .');
			}
		}

		function update() {
			console.log('updating timer');
			var updating = data.updating,
				time = data.updatedAt;

			clearTimeout(timeoutID);

			toggleUpdateIndicator(data.updating);

			if (updating) {
				return;
			}

			if (typeof time === 'number') {
				setLabel(getTimeElapsed(time) + ' ago');

				timeoutID = setTimeout(update, 10000);
			}
			else if (time === null) {
				setLabel('Never');
			}
		}

		return update;
	})();

	/* User */
	var updateUsername = (function() {
		var userBar = document.getElementById('user_bar'),
			usernameDisplay = document.getElementById('username_display'),
			usernameField = document.getElementById('username_field');

		document.getElementById('username').addEventListener('click', toggleMode.bind(null, true), false);

		document.getElementById('username_cancel').addEventListener('click', toggleMode.bind(null, false), false);

		document.getElementById('username_confirm').addEventListener('click', confirm, false);

		usernameField.addEventListener('keyup', function(event) {
			if (event.keyCode === 13) {
				confirm();
			}
		});

		function toggleMode(add) {
			add = add || false;

			userBar.classList.toggle('editing', add);

			if (add) {
				usernameField.value = data.username;
				usernameField.select();
			}
		}

		function set() {
			var username = usernameField.value;

			TwitchTuner.setUsername(username);

			display(username);
		}

		function confirm() {
			set();

			toggleMode(false);
		}

		function display(value) {
			usernameDisplay.innerHTML = value;
		}

		function warn(message) {
			userBar.classList.toggle('warning', true);

			display(message);
		}

		return function() {
			if (data.username === null) {
				warn('Enter Twitch username');
			}
			else if (data.validUsername === false) {
				warn('Invalid Twitch username');
			}
			else {
				userBar.classList.toggle('warning', false);

				display(data.username);
			}
		};
	})();

	document.getElementById('options_button').addEventListener('click', function() {
		TwitchTuner.openOptions();
	}, false);

	function toggleFavorite(element, channel) {
		console.log('toggleFavorite(', element, channel, ')');
		var favorited = element.getAttribute('data-favorite') === 'true' ? true : false;
		console.log('favorited?', favorited);
		Channels.favorite(channel, ! favorited);

		element.setAttribute('data-favorite', ! favorited);
	}

	function getChannelName(element) {
		while (! element.classList.contains('item')) {
			element = element.parentNode;
		}

		return element.getAttribute('data-channel');
	}

	/* Streams */
	var updateStreams = (function() {
		var streamList = document.getElementById('streams_pane');

		function display(html) {
			streamList.innerHTML = html;
		}

		function generateListItem(stream, html) {
			html += '<li class="item stream" data-channel="' + stream.name + '">';
				html += '<h2>';
				 	html += stream.displayName;
					html += '<span class="favorite" data-favorite="' + stream.favorite + '"></span>';
				html += '</h2>';

			if (stream.game !== null) {
				html += '<p>';
					html += '<img class="icon" src="/img/game.png">';
					html += '<span class="game" data-game="' + stream.game + '">';
						html += stream.game;
					html += '</span>';
				html += '</p>';
			}

				html += '<p class="audience">';
					html += '<img class="icon" src="/img/audience.png">';
					html += '<span class="viewers">';
					 	html += stream.formattedViewers + ' viewers';
					html += '</span>';
				html += '</p>';

				html += '<div class="preview-button"></div>';

			html += '</li>';

			return html;
		}

		function generateList() {
			return Channels.reduceStreams(generateListItem, '');
		}

		function generatePreview(channelName) {
			console.log('generatePreview(',channelName,')');
			var stream = Channels.streams.get(channelName),
				html = '<div class="preview" data-description="' + stream.description + '">';

			html += '<img src="' + stream.preview + '">';

			html += '</div>';

			return html;
		}

		function togglePreview(element, channel) {
			var container = element.parentElement;

			if (! container.lastChild.classList.contains('preview')) {
				container.innerHTML += generatePreview(channel);
			}

			container.classList.toggle('show-preview');
		}

		streamList.addEventListener('click', function(event) {
			var element = event.target;

			if (element.classList.contains('game')) {
				TwitchTuner.openGame(element.getAttribute('data-game'));
			}
			else if (element.classList.contains('favorite')) {
				toggleFavorite(element, getChannelName(element));
			}
			else if (element.classList.contains('preview-button')) {
				togglePreview(element, getChannelName(element));
			}
			else {
				TwitchTuner.openStream(getChannelName(element));
			}

			event.stopPropagation();
		}, false);

		function update() {
			if (data.username === null || data.validUsername === false) {
				display('<p class="notice">Enter you Twitch.tv username to see when your followed channels are live.</p>');
			}
			else if (Channels.countChannels() === 0) {
				display('<p class="notice">Follow some channels to see when they go live.</p>');
			}
			else if (Channels.countStreams() === 0) {
				display('<p class="notice">None of your followed channels are currently live.</p>');
			}
			else {
				display(generateList());
			}
		}

		return update;
	})();

	/* Channels */
	var updateChannels = (function() {
		var channelList = document.getElementById('channels_pane');

		function display(html) {
			channelList.innerHTML = html;
		}

		function generateListItem(channel, html) {
			html += '<li class="item channel" data-channel="' + channel.name + '">';
				html += '<h2>';
					html += channel.displayName;
					html += '<span class="favorite" data-favorite="' + channel.favorite + '"></span>';
				html += '</h2>';
				html += '<p class="audience">';
					html += '<img class="icon" src="/img/audience.png">';
					html += '<span class="followers">';
						html += channel.formattedFollowers + ' followers';
					html += '</span>';
				html += '</p>';
			html += '</li>';

			return html;
		}

		function generateList() {
			return Channels.reduceChannels(generateListItem, '');
		}

		channelList.addEventListener('click', function(event) {
			var element = event.target,
				channel = getChannelName(element);

			if (element.classList.contains('favorite')) {
				toggleFavorite(element, channel);
			}
			else {
				TwitchTuner.openChannel(channel);
			}
		}, false);

		function update() {
			if (data.username === null || data.validUsername === false) {
				display('<p class="notice">Enter you Twitch.tv username to see your followed channels here.</p>');
			}
			else if (Channels.countChannels() === 0) {
				display('<p class="notice">You are not following any channels.</p>');
			}
			else {
				display(generateList());
			}
		}

		return update;
	})();


	/* Tab Switching */
	var Tabs = {
		tabBar: document.getElementById('tab_bar'),
		tabs: {
			'streams': {
				tab: document.getElementById('streams_tab'),
				pane: document.getElementById('streams_pane'),
				active: false,
				updated: false,
				update: updateStreams
			},
			'channels': {
				tab: document.getElementById('channels_tab'),
				pane: document.getElementById('channels_pane'),
				active: false,
				updated: false,
				update: updateChannels
			}
		},
		title: function(type) {
			console.log('Tabs.title(', type, ')');
			console.log('data:', data);
			var title;

			if (type === 'streams') {
				title = Channels.countStreams() + ' Streams';
			}
			else if (type === 'channels') {
				title = Channels.countChannels() + ' Channels';
			}
			console.info(title);
			this.tabs[type].tab.innerHTML = title;
		},
		update: function(type) {
			console.log('Tabs.update(', type, ')');
			var tab = this.tabs[type];

			this.title(type);

			if (tab.active) {
				tab.update();
				tab.updated = true;
			}
			else {
				tab.updated = false;
			}
		},
		show: function(type) {
			var tab = this.tabs[type];

			tab.active = true;

			tab.tab.classList.add('active');
			tab.pane.classList.add('active');
		},
		hide: function(type) {
			var tab = this.tabs[type];

			tab.active = false;

			tab.tab.classList.remove('active');
			tab.pane.classList.remove('active');
		},
		display: function(type) {
			for (var key in this.tabs) {
				if (key === type) {
					this.show(key);
				}
				else {
					this.hide(key);
				}
			}
		},
		select: function(type) {
			var tab = this.tabs[type];

			if (tab.active) {
				return;
			}

			this.display(type);
			this.update(type);
		}
	};

	Tabs.tabBar.addEventListener('click', function(event) {
		var element = event.target;

		if (element.className === 'tab') {
			Tabs.select(element.getAttribute('data-tab'));
		}
	}, false);

	function processUpdate(type, value) {
		console.log('processUpdate(', type, ')');
		if (type === 'streams' || type === 'channels') {
			Tabs.update(type);
		}
		else if (type === 'username' || type === 'validUsername') {
			data[type] = value;
			updateUsername();
		}
		else if (type === 'updatedAt' || type === 'updating') {
			data[type] = value;
			updateTimer();
		}
	}

	chrome.runtime.onMessage.addListener(function(message) {
		console.log('Message received:', message);
		for (var key in message) {
			processUpdate(key, message[key]);
		}
	});

	data = TwitchTuner.getData();

	updateUsername();
	updateTimer();

	Tabs.select('streams');
	Tabs.update('channels');
})();
