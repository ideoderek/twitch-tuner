function compare() {
	var aAttr = a[this.groupBy],
		bAttr = b[this.groupBy],
		result;

	if (aAttr !== bAttr) {
		result = aAttr > bAttr ? 1 : -1;
		result = typeof aAttr === 'string' ? -result : result;
		return this.groupDirection ? -result : result;
	}

	aAttr = a[this.sortBy];
	bAttr = b[this.sortBy];

	if (aAttr !== bAttr) {
		result = aAttr > bAttr ? 1 : -1;
		result = typeof aAttr === 'string' ? -result : result;
		return this.sortDirection ? -result : result;
	}

	return 0;
}

export class DictionarySorter {
	constructor(descriptor) {
		this.configure(descriptor)

		this.compare = compare.bind(this)
	}

	configure(descriptor) {
		for (let key in descriptor) {
			this[key] = descriptor[key]
		}
	}

	define(dictionary, order) {
		this.dictionary = dictionary

		this.order = order
	}

	// TODO: speed this up
	update(key) {
		let data = this.dictionary
		let keys = this.order
		let index = keys.indexOf(key)

		if (index === -1) {
			return
		}

		keys.splice(index, 1)

		for (let i in keys) {
			if (this.compare(data[key], data[keys[i]]) <= 0) {
				keys.splice(i, 0, key);

				return;
			}
		}

		keys.splice(keys.length, 0, key);
	}

	// TODO: This method uses insertion sort
	// Insertion sort is well-suited to nearly sorted data
	// Which makes it appropriate for non-initial updates
	// A different algorithm would be better for the initial update
	sort() {
		let data = this.dictionary
		let keys = this.order
		let length = keys.length

		for (let i = 1; i < length; i++) {
			let key = keys[i]
			let j = i

			while (j > 0 && this.compare(data[key], data[keys[j - 1]]) < 0) {
				j -= 1
			}

			keys.splice(i, 1)
			keys.splice(j, 0, key)
		}

		return keys
	}
}
