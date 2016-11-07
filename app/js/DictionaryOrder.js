function DictionaryOrder(dictionary, descriptor) {
    this.sorter = new DictionarySorter(descriptor);
    this.reset(dictionary);
}

DictionaryOrder.prototype.reset = function(dictionary) {
    this.dictionary = dictionary;

    this.order = [];
    this.index = 0;

    this.sorter.define(this.dictionary, this.order);
};

DictionaryOrder.prototype.keys = function() {
    return this.order.slice();
};

DictionaryOrder.prototype.count = function() {
    return this.order.length;
};

DictionaryOrder.prototype.add = function(key) {
    if (hasElement(this.order, key)) {
        return;
    }

    addToSet(this.order, key);
};

DictionaryOrder.prototype.update = function(key) {
    this.sorter.update(key);
};

DictionaryOrder.prototype.remove = function(key) {
    removeFromSet(this.order, key);
};

DictionaryOrder.prototype.sort = function() {
    if (this.count() > 1) {
        this.sorter.sort();
    }
};

DictionaryOrder.prototype.configureSorting = function(descriptor) {
    this.sorter.configure(descriptor);

    this.sort();
};

DictionaryOrder.prototype.reduce = function(reducer, value) {
    var keys = this.order.slice();

    for (var i in keys) {
        value = reducer(this.dictionary[keys[i]], value);
    }

    return value;
};

DictionaryOrder.prototype.filter = function(filter) {
    var keys = this.order,
        data = this.dictionary,
        result = [];

    for (var i in keys) {
        var element = data[keys[i]];

        if (filter(element)) {
            result.push(element);
        }
    }

    return result;
};
