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
    var copy = function() {}
    copy.prototype = parent.prototype;
    var c = new copy();
    c.constructor = child;
    child.prototype = c;

    child.prototype.__super__ = parent.prototype;
    child.prototype.__super__.init = parent.prototype.constructor;
    return child;
}
