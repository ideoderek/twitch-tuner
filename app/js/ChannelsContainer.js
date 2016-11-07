function ChannelContainer() {
	this.autoFavorite = Storage.get('Favorites_AutoByNotifications');
	Storage.listen('Favorites_AutoByNotifications', this.setAutoFavoriting.bind(this));
	this.favorites = Storage.get('Favorites') || [];

	this.channelData = {};

	this.channels = new DictionaryOrder(this.channelData, this.getSortParameters('Channels'));
	this.streams = new DictionaryOrder(this.channelData, this.getSortParameters('Streams'));
}

ChannelContainer.prototype.setAutoFavoriting = function(value) {
	this.autoFavorite = value;
};

ChannelContainer.prototype.clear = function() {
	this.channelData = {};

    this.channels.reset(this.channelData);
    this.streams.reset(this.channelData);
};

ChannelContainer.prototype.update = function(data, keys, update, remove) {
	data.forEach(function(element) {
		update(element);

		removeFromSet(keys, element.channel.name);
	});

	keys.forEach(remove);
};

// Channels

ChannelContainer.prototype.updateChannels = function(data) {
	this.update(data, this.channels.keys(), this.updateChannel.bind(this), this.unfollow.bind(this));

	this.channels.sort();
};

ChannelContainer.prototype.updateChannel = function(data) {
	var channel = data.channel,
		name = channel.name,
		object = this.channelData[name] || {name: name};

	object.displayName = channel.display_name;
	object.followers = channel.followers;
	object.formattedFollowers = channel.followers.toLocaleString();
	object.favorite = this.isFavorite(name, data.notifications);

	if (! (name in this.channelData)) {
		this.channelData[name] = object;
	}

	this.channels.add(name);
};

ChannelContainer.prototype.unfollow = function(channelName) {
	delete this.channelData[channelName];

	this.channels.remove(channelName);
	this.streams.remove(channelName);
};

ChannelContainer.prototype.countChannels = function() {
	return this.channels.count();
};

ChannelContainer.prototype.getChannelNames = function() {
    return this.channels.keys();
};

// Streams

ChannelContainer.prototype.updateStreams = function(data) {
	this.update(data, this.streams.keys(), this.updateStream.bind(this), this.offline.bind(this));

	this.streams.sort();
};

ChannelContainer.prototype.updateStream = function(data) {
	var object = this.channelData[data.channel.name];

	object.game = data.game || null;
	object.viewers = data.viewers;
	object.formattedViewers = data.viewers.toLocaleString();
	object.description = data.channel.status;
	object.preview = data.preview.medium;

	this.streams.add(data.channel.name);
};

ChannelContainer.prototype.offline = function(channelName) {
	this.streams.remove(channelName);

	var channel = this.channelData[channelName];
	delete channel.game;
	delete channel.viewers;
	delete channel.formattedViewers;
	delete channel.description;
	delete channel.preview;
};

ChannelContainer.prototype.countStreams = function() {
	return this.streams.count();
};

ChannelContainer.prototype.getLiveChannelNames = function() {
    return this.streams.keys();
};

ChannelContainer.prototype.getSortParameters = function(type) {
	var listener = this.setSortParameter.bind(this);

	return {
		SortAttribute: Storage.get(type + '_SortAttribute', listener),
		SortDescending: Storage.get(type + '_SortDescending', listener),
		GroupAttribute: Storage.get(type + '_GroupAttribute', listener),
		GroupDescending: Storage.get(type + '_GroupDescending', listener)
	};
};

ChannelContainer.prototype.setSortParameter = function(value, name) {
	var parameter = name.split('_'),
		descriptor = {};

	descriptor[parameter[1]] = value;

	this[parameter[0].toLowerCase()].configureSorter(descriptor);
};

// I hate that this query method has a side-effect
ChannelContainer.prototype.isFavorite = function(channelName, notifications) {
	if (hasElement(this.favorites, channelName)) {
		return true;
	}

	if (this.autoFavorite && notifications) {
		this.favorites.push(channelName);

		return true;
	}

	return false;
};

ChannelContainer.prototype.favorite = function(channelName, favorite) {
	this.channelData[channelName].favorite = favorite;

	this.channels.update(channelName);
	this.streams.update(channelName);

	toggleInSet(this.favorites, channelName, favorite);
	Storage.set('Favorites', this.favorites);
};

ChannelContainer.prototype.reduceChannels = function() {
	return this.channels.reduce.apply(this.channels, arguments);
};

ChannelContainer.prototype.reduceStreams = function() {
	return this.streams.reduce.apply(this.streams, arguments);
};

ChannelContainer.prototype.filterStreams = function() {
    return this.streams.filter.apply(this.streams, arguments);
};

ChannelContainer.prototype.get = function(channelName) {
	return this.channelData[channelName];
};
