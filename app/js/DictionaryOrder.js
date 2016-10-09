function DictionaryOrder(dictionary, order) {
    if (order === undefined) {
        order = Object.keys(dictionary);
    }

    this.dictionary = dictionary;
    this.order = order;

    this.index = 0;

    this.sort();
}

DictionaryOrder.prototype.count = function() {
    return this.order.length;
};

DictionaryOrder.prototype.sort = function() {
    if (this.order.length > 1) {
        this.order = this.sorter.sort(this.order, this.dictionary);
    }
};

DictionaryOrder.prototype.update = function(key) {
    if (this.order.indexOf(key) === -1) {
        this.order = this.sorter.insert(key, this.order, this.dictionary);
    }
    else {
        this.order = this.sorter.update(key, this.order, this.dictionary);
    }
};

DictionaryOrder.prototype.configure = function(descriptor) {
    if (this.sorter.configure(descriptor)) {
        this.sort();
    }
};

DictionaryOrder.prototype.next = function() {
    this.index++;

    if (this.index > this.count()) {
        return undefined;
    }

    if (this.outOfSync) {
        throw null;
    }

    return this.dictionary[this.order[this.index]];
};
