var Sorter = (function() {
	function sort(a, b) {
		if (a === b) {
			return 0;
		}

		var result = a < b ? -1 : 1;

		return typeof a === 'string' ? -result : result;
	}

	function direction(result, descending) {
		return descending ? result : -result;
	}

	function middle(min, max) {
		return Math.floor((min + max) / 2);
	}

	function CollectionSorter(descriptor) {
		if (descriptor !== undefined) {
			this.configure(descriptor);
		}
	}

	// descriptor { sortAttribute, sortDescending, groupAttribute, groupDescending}
	CollectionSorter.prototype.configure = function(descriptor) {
		for (var key in descriptor) {
			this[key] = descriptor[key];
		}

		this.sorter = this.generateSorter();
	};

	CollectionSorter.prototype.generateSorter = function() {
		var sAttr = this.SortAttribute,
			sDesc = this.SortDescending,
			gAttr = this.GroupAttribute,
			gDesc = this.GroupDescending;

			console.log('sort attr', sAttr);
			console.log('sort desc', sDesc);
			console.log('group attr', gAttr);
			console.log('group desc', gDesc);
		return function(pivot, element) {
			console.log('pivot', pivot, 'element', element);
			var result = direction(sort(pivot[gAttr], element[gAttr]), gDesc);

			if (result === 0) {
				return direction(sort(pivot[sAttr], element[sAttr]), sDesc);
			}

			return result;
		};
	};

	CollectionSorter.prototype.sort = function(keys, values) {
		console.log('CollectionSorter.sort(', keys, values, ')');
		var pivot = values[keys[0]],
			length = keys.length,
			less = [],
			more = [];
console.log('pivot:', pivot);
console.log('keys[0]', keys[0]);
console.log('values[keys[0]]', values[keys[0]]);
		for (var i = 1; i < length; i++) {
			var key = keys[i];

			if (this.sorter(pivot, values[key]) > 0) {
				more.push(key);
			}
			else {
				less.push(key);
			}
		}

		less = less.length === 0 ? [] : this.sort(less, values);
		more = more.length === 0 ? [] : this.sort(more, values);

		return less.concat(keys[0], more);
	};

	CollectionSorter.prototype.insert = function(key, keys, values) {
		console.log('CollectionSorter.insert(', key, keys, values, ')');
		var value = values[key],
			under = keys.length,
			over = -1;

		while (over < under - 1) {
			var i = middle(under, over),
				result = this.sorter(values[keys[i]], value);

			if (result > 0) {
				over = i;
			}
			else if (result < 0) {
				under = i;
			}
			else {
				keys.splice(i, 0, key);

				return keys;
			}
		}

		keys.splice(over + 1, 0, key);

		return keys;
	};

	CollectionSorter.prototype.update = function(key, keys, values) {
		console.log('CollectionSorter.update(', key, keys, values, ')');
		if (keys.length === 1) {
			return keys;
		}

		keys.splice(keys.indexOf(key), 1);

		return this.insert(key, keys, values);
	};

	return CollectionSorter;
})();