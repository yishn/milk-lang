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
