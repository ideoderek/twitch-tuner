function DictionarySorter(dictionary, order, descriptor) {
	this.dictionary = dictionary;
	this.order = order;

	this.descriptor = {};

	this.configure(descriptor);
}

DictionarySorter.prototype.configure = function(descriptor) {
	if (descriptor === undefined) {
		return;
	}

	for (var key in descriptor) {
		this.descriptor[key] = descriptor[key];
	}

	this.generateSorter(
		this.descriptor.GroupAttribute,
		this.descriptor.GroupDescending,
		this.descriptor.SortAttribute,
		this.descriptor.SortDescending
	);
};

DictionarySorter.prototype.generateSorter = function(groupAttribute, groupDescending, sortAttribute, sortDescending) {
	this.compare = function(a, b) {
		var aAttr = a[groupAttribute],
			bAttr = b[groupAttribute],
			result;

		if (aAttr !== bAttr) {
			result = aAttr > bAttr ? 1 : -1;
			result = typeof aAttr === 'string' ? -result : result;
			return groupDescending ? -result : result;
		}

		aAttr = a[sortAttribute];
		bAttr = b[sortAttribute];

		if (aAttr !== bAttr) {
			result = aAttr > bAttr ? 1 : -1;
			result = typeof aAttr === 'string' ? -result : result;
			return sortDescending ? -result : result;
		}

		return 0;
	};
};

/* This could be sped up significantly, but is not called often. */
DictionarySorter.prototype.update = function(key) {
	var data = this.dictionary,
		keys = this.order,
		index = keys.indexOf(key);

	if (index === -1) {
		return;
	}

	keys.splice(index, 1);

	for (var i in keys) {
		if (this.compare(data[key], data[keys[i]]) <= 0) {
			keys.splice(i, 0, key);

			return;
		}
	}

	keys.splice(keys.length, 0, key);
};

/*	This method uses a (probably poorly-implemented) insertion sort.
	Insertion sort runs especially quickly on nearly sorted data.
	Making it well-suited to sorting channels/streams after the first update.
	Heap sort would probably be a better solution for the initial update. */
DictionarySorter.prototype.sort = function() {
	var data = this.dictionary,
		keys = this.order,
		length = keys.length;

	for (var i = 1; i < length; i++) {
		var key = keys[i],
			j = i;

		while (j > 0 && this.compare(data[key], data[keys[j - 1]]) < 0) {
			j -= 1;
		}

		keys.splice(i, 1);
		keys.splice(j, 0, key);
	}

	return keys;
};