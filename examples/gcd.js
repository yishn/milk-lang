(function() {

var _ = {}, gcd;
_.modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
/*@1:1*/
gcd = function() {
    var first, rest, gcdInner;
    (function(ref) {
        first = ref[0];
        rest = (1 >= ref.length) ? [] : [].slice.call(ref, 1);
        return ref;
    })(arguments);
    /*@2:5*/
    if (rest.length === 0) {
        return first;
    }
    /*@4:5*/
    gcdInner = function(a, b) {
        return (b === 0) ? a : gcdInner(b, _.modulo(a, b));
    }
    return gcdInner(first, (function() {
        var r;
        r = [];
        r.push.apply(r, rest);
        return gcd.apply(this, r);
    })());
}

})();

//: 787ms
