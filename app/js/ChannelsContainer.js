var ChannelsContainer = (function() {
	function Channels() {
		this.autoFavorite = Storage.get('Favorites_AutoByNotifications');
		this.favorites = Storage.get('Favorites') || [];

		this.channels = new Collection(new Sorter());
		this.streams = new Collection(new Sorter());

		this.channels.configureSorter(this.getSortParameters('Channels'));
		this.streams.configureSorter(this.getSortParameters('Streams'));
	}

	Channels.prototype.countStreams = function() {
	    return this.streams.count();
	};

	Channels.prototype.countChannels = function() {
	    return this.channels.count();
	};

	Channels.prototype.getChannelNames = function() {
	    return this.channels.keys();
	};

	Channels.prototype.getSortParameters = function(type) {
		var listener = this.setSortParameter.bind(this);

		return {
			SortAttribute: Storage.get(type + '_SortAttribute', listener),
			SortDescending: Storage.get(type + '_SortDescending', listener),
			GroupAttribute: Storage.get(type + '_GroupAttribute', listener),
			GroupDescending: Storage.get(type + '_GroupDescending', listener)
		};
	};

	Channels.prototype.setSortParameter = function(value, name) {
		console.log('Channels.setSortParameter(', value, name, ')');
		var parameter = name.split('_'),
			descriptor = {};

		descriptor[parameter[1]] = value;

		this[parameter[0].toLowerCase()].configureSorter(descriptor);
	};

	Channels.prototype.reset = function() {
	    this.channels.clear();
	    this.streams.clear();
	};

	Channels.prototype.isFavorite = function(channel, notifications) {
		if (this.favorites.indexOf(channel) !== -1) {
			return true;
		}

		if (this.autoFavorite && notifications) {
			this.favorites.push(channel);

			return true;
		}

		return false;
	};

	Channels.prototype.favorite = function(channelName, favorite) {
		var index = this.favorites.indexOf(channelName);

		this.channels.act(channelName, 'favorite', favorite);
		this.streams.act(channelName, 'favorite', favorite);

		if (favorite && index === -1) {
			this.favorites.push(channelName);
		}
		else if (! favorite && index !== -1) {
			this.favorites.splice(index, 1);
		}

		Storage.set('Favorites', this.favorites);
	};

	Channels.prototype.reduceChannels = function() {
		return this.channels.reduce.apply(this.channels, arguments);
	};

	Channels.prototype.reduceStreams = function() {
		return this.streams.reduce.apply(this.streams, arguments);
	};

	Channels.prototype.unfollow = function(name) {
		this.channels.unset(name);
		this.streams.unset(name);
	};

	Channels.prototype.updateChannel = function(name, data) {
		var channel = data.channel;

		this.channels.set(name, {
			name: name,
			displayName: channel.display_name,
			followers: channel.followers,
			formattedFollowers: channel.followers.toLocaleString(),
			favorite: this.isFavorite(name, data.notifications)
		});
	};

	Channels.prototype.updateChannels = function(channels) {
		var unfollowed = this.getChannelNames();

		for (var i in channels) {
			var channel = channels[i],
				name = channel.channel.name;

			this.updateChannel(name, channel);

			var index = unfollowed.indexOf(name);
			if (index !== -1) {
				unfollowed.splice(index, 1);
			}
		}

		unfollowed.forEach(this.unfollow, this);
	};

	Channels.prototype.offline = function(name) {
		this.streams.unset(name);
	};

	Channels.prototype.updateStream = function(name, data) {
		var stream = this.streams.get(name);

		if (stream === undefined) {
			stream = {channel: this.channels.get(name)};
		}

		stream.game = data.game ? data.game : null;
		stream.viewers = data.viewers;
		stream.formattedViewers = data.viewers.toLocaleString();
		stream.description = data.channel.status;
		stream.preview = data.preview.medium;
		stream.favorite = stream.channel.favorite;

		this.streams.set(name, stream);
	};

	Channels.prototype.updateStreams = function(streams) {
		var offline = this.streams.keys();

		for (var i in streams) {
			var stream = streams[i],
				name = stream.channel.name;

			this.updateStream(name, stream);

			var index = offline.indexOf(name);
			if (index !== -1) {
				offline.splice(index, 1);
			}
		}

		offline.forEach(this.offline, this);
	};

	return Channels;
})();