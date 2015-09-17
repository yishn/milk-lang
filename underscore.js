var _ = {};

_.modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
};

_.enumerate = function(list) {
    if (!Array.isArray(list) && typeof list !== 'string')
        list = Object.keys(list);

    return {
        get: function(i) { return list[i] },
        length: list.length
    };
};

_.enumerateKeys = function(list) {
    if (!Array.isArray(list) && typeof list !== 'string')
        return this.enumerate(list);

    return {
        get: function(i) { return i },
        length: list.length
    };
};

_.inOp = function(el, list) {
    if (!Array.isArray(list) && typeof list !== 'string')
        return el in list

    return list.indexOf(el) != -1
}

_.extends = function(child, parent) {
    for (var key in parent) {
        if ({}.hasOwnProperty.call(parent, key))
            child[key] = parent[key];
    }
    var ctor = function() { this.constructor = child; };
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
}
