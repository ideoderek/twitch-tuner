export default class Set {
	constructor(seed) {
		this.data = seed === undefined ? [] : seed.slice()
	}

	get length() {
		return this.data.length
	}

	all() {
		return this.data.slice()
	}

	remove(value) {
		let index = this.index(value)

		if (index > -1) {
			this.data.splice(index, 1)
		}
	}

	add(value) {
		if (! this.has(value)) {
			this.data.push(value)
		}
	}

	insertBefore(insert, before) {
		this.data.splice(before, 0, insert)
	}

	has(value) {
		return this.index(value) > -1
	}

	index(value) {
		return this.data.indexOf(value)
	}

	toggle(value, add) {
		if (add === true) {
			this.add(value)
		}
		else if (add === false) {
			this.remove(value)
		}
		else if (this.has(value)) {
			this.remove(value)
		}
		else {
			this.add(value)
		}
	}
}
