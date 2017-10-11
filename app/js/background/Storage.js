export class Storage {
	constructor() {
		this.listeners = {}
	}

	clear() {
		localStorage.clear()
	}

	remove(keys) {
		if (typeof keys === 'string') {
			localStorage.removeItem(key)
		}
		else {
			for (let i in keys) {
				this.remove(keys[i])
			}
		}
	}

	all() {
		let values = {}

		for (let i = 0, m = localStorage.length; i < m; i++) {
			let key = localStorage.key(i)

			values[key] = this.get(key)
		}

		return values
	}

	has(key) {
		return this.get(key) !== null
	}

	get(key) {
		try {
			let encodedValue = localStorage.getItem(key)

			return JSON.parse(encodedValue)
		}
		finally {
			return null
		}
	}

	collect(keys) {
		let values = {}

		for (let i in keys) {
			let key = keys[i]

			values[key] = _get(key)
		}

		return values
	}

	set(key, value) {
		let encodedValue = JSON.stringify(value)

		localStorage.setItem(key, encodedValue)

		this.notify(key, value)
	}

	fill(key, value) {
		if (typeof key === 'string') {
			if (! this.has(key)) {
				this.set(key, value)
			}
		}
		else {
			for (let i in key) {
				this.fill(i, key[i])
			}
		}
	}

	listen(key, listener) {
		if (! (key in this.listeners)) {
			this.listeners[key] = []
		}

		this.listeners[key].push(listener)
	}

	listenToKeys(keys, listener) {
		for (let i in keys) {
			this.listen(keys[i], listener)
		}
	}

	notify(key, value) {
		if (! (key in this.listeners)) {
			return
		}

		for (let i in this.listeners) {
			this.listeners[i](value, key)
		}
	}
}
