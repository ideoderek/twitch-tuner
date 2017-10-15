export class DictionarySorter {
	constructor(descriptor) {
		this.configure(descriptor)
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

	update(key) {
		if (! this.order.has(key)) {
			return
		}

		this.order.remove(key)

		let value = this.dictionary[key]
		let keys = this.order.all()

		for (let i in keys) {
			let current = this.dictionary[keys[i]]

			if (this.compare(value, current) <= 0) {
				this.order.insertBefore(key, i)

				return
			}
		}

		this.order.add(key)
	}

	sort() {
		let data = this.dictionary
		let length = this.order.length

		for (let i = 1; i < length; i++) {
			let keys = this.order.all()
			let key = keys[i]
			let j = i

			while (j > 0 && this.compare(data[key], data[keys[j - 1]]) < 0) {
				j -= 1
			}

			this.order.remove(key)
			this.order.insertBefore(key, j)
		}
	}

	compare(a, b) {
		let aAttr = a[this.groupBy]
		let bAttr = b[this.groupBy]
		let result

		if (aAttr !== bAttr) {
			result = aAttr > bAttr ? 1 : -1
			result = typeof aAttr === 'string' ? -result : result
			return this.groupDirection ? -result : result
		}

		aAttr = a[this.sortBy]
		bAttr = b[this.sortBy]

		if (aAttr !== bAttr) {
			result = aAttr > bAttr ? 1 : -1
			result = typeof aAttr === 'string' ? -result : result
			return this.sortDirection ? -result : result
		}

		return 0
	}
}
