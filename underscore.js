var _ = {};

_.modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}

_.enumerate = function(list) {
    var classname = toString.call(list);
    if (classname !== '[object Array]' && classname !== '[object String]')
        return Object.keys(list);

    return list;
}

_.inOp = function(el, list) {
    var classname = toString.call(list);
    if (classname !== '[object Array]' && classname !== '[object String]')
        return el in list;

    return list.indexOf(el) != -1;
}

_.equals = function(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a == b;
    var classname = toString.call(a);
    if (classname !== toString.call(b)) return false;

    var areArrays = classname === '[object Array]';
    var areObjects = classname === '[object Object]';

    if (areArrays) {
        if (a.length !== b.length) return false;

        for (var i = 0; i < a.length; i++) {
            if (!_.equals(a[i], b[i]))
                return false;
        }

        return true;
    } else if (areObjects) {
        var akeys = Object.keys(a);
        if (akeys.length !== Object.keys(b).length) return false;

        for (var i = 0; i < akeys.length; i++) {
            key = akeys[i];
            if (!(key in b))
                return false;
            if (!_.equals(a[key], b[key]))
                return false;
        }

        return true;
    }

    return false;
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
