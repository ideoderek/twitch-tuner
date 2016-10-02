function Collection(sorter) {
	this.sorter = sorter;

	this.clear();
}

Collection.prototype.clear = function() {
	this.order = [];
	this.data = {};

	this.index = 0;
};

Collection.prototype.count = function() {
	return this.order.length;
};

Collection.prototype.configureSorter = function(descriptor) {
	console.log('Collection.configureSorter(', descriptor, ')');
    this.sorter.configure(descriptor);

	this.sort();
};

Collection.prototype.sort = function() {
	if (this.order.length > 1) {
		this.order = this.sorter.sort(this.order, this.data);
	}
};

Collection.prototype.set = function(key, value) {
	this.data[key] = value;

	if (this.order.indexOf(key) === -1) {
		this.order = this.sorter.insert(key, this.order, this.data);
	}
	else {
		this.order = this.sorter.update(key, this.order, this.data);
	}
};

Collection.prototype.unset = function(key) {
	var i = this.order.indexOf(key);

	if (i !== -1) {
		this.order.splice(i, 1);
		delete this.data[key];

		this.changed(i);
	}
};

Collection.prototype.get = function(key) {
	return this.data[key];
};

Collection.prototype.keys = function() {
    return this.order.concat();
};

Collection.prototype.values = function() {
    var values = [];

	for (var i in this.order) {
		values.push(this.data[this.order[i]]);
	}

	return values;
};

Collection.prototype.changed = function(changedIndex) {
	if (changedIndex > this.index) {
		return;
	}

	this.outOfSync = true;
};

Collection.prototype.act = function(key, property, value) {
	var object = this.get(key);

	if (object === null) {
		return;
	}

	object[property] = value;

	this.set(key, object);
};

Collection.prototype.next = function() {
	var index = this.index++;

	if (index >= this.count()) {
		return undefined;
	}

	if (this.outOfSync) {
		throw null;
	}

	return this.get(this.order[index]);
};

// Currently, this can fail if accumulator is an object
Collection.prototype.reduce = function(reducer, accumulator, combinator) {
	this.index = 0;
	this.outOfSync = false;

	var result = accumulator,
		combine = combinator || function(acc, val) { return acc + val; },
		element;

	try {
		while ((element = this.next()) !== undefined) {
			result = combine(result, reducer(element));
		}

		return result;
	}
	catch (e) {
		console.error('wat is happen', e);
		return this.reduce(reducer, accumulator, combinator);
	}
};