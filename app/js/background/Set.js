export class Set {
	constructor() {
		this.data = []
	}

	data() {
		return this.data
	}

	copy() {
		return this.data.slice()
	}

	remove(value) {
		let index = this.data.indexOf(value)

		if (index > -1) {
			this.data.splice(index, 1)
		}
	}

	add(value) {
		if (! this.has(value)) {
			this.data.push(value)
		}
	}

	has(value) {
		return this.data.indexOf(value) > -1
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
