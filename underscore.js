var _ = {};

_.modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}

_.enumerate = function(list) {
    if (!Array.isArray(list) && typeof list !== 'string')
        return Object.keys(list);

    return list
}

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
    var ctor = function() {
        this.constructor = child;
        this.init = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
}
