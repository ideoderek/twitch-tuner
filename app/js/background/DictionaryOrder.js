import {DictionarySorter as Sorter} from "./DictionarySorter.js"
import Set from "./Set.js"

export class DictionaryOrder {
	constructor(dictionary, descriptor) {
		this.sorter = new Sorter(descriptor)

		this.reset(dictionary)
	}

	reset(dictionary) {
		this.dictionary = dictionary

	    this.order = new Set()
	    this.index = 0

	    this.sorter.define(this.dictionary, this.order)
	}

	keys() {
		return this.order.all()
	}

	count() {
		return this.order.length
	}

	add(key) {
		this.order.add(key)
	}

	remove(key) {
	    this.order.remove(key)
	}

	sort() {
	    if (this.count() > 1) {
	        this.sorter.sort()
	    }
	}

	configureSorting(descriptor) {
	    this.sorter.configure(descriptor)

	    this.sort()
	}

	update(key) {
	    this.sorter.update(key)
	}

	reduce(reducer, value) {
		let keys = this.order.all()

	    for (let i in keys) {
	        value = reducer(this.dictionary[keys[i]], value)
	    }

	    return value
	}

	filter(filter) {
		let keys = this.order.all()
		let result = []

	    for (let i in keys) {
	        let element = this.dictionary[keys[i]]

	        if (filter(element)) {
	            result.push(element)
	        }
	    }

	    return result
	}
}
