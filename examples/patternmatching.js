(function() {
var _ = {}, list;
_.enumerate = function(l) {
    var t = toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
/*@1:1*/
list = [[1, 3], [4, 3], [2, 4], [5, 3], [5, 6], [3, 1]];
console.log((function() {
    var r, i, l, a, b;
    r = [];
    l = _.enumerate(list);
    for (i = 0; i < l.length; i++) {
        (function(ref) {
            a = ref[0];
            b = ref[1];
            return ref;
        })(l[i]);
        r.push(a + b);
    }
    return r;
})());
})();

//: 442ms
