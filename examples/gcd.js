(function() {
var gcd;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
/*@3:1*/
// -*- javascript -*-
gcd = function() {
    var args, gcdInner, middle;
    (function(r) {
        args = (0 >= r.length) ? [] : [].slice.call(r, 0);
        return r;
    })(arguments);
    /*@4:5*/
    if (args.length === 1) {
        return args[0];
    };
    gcdInner = function(a, b) {
        return (b === 0) ? a : gcdInner(b, modulo(a, b));
    };
    /*@8:5*/
    middle = Math.floor((args.length - 1) / 2);
    return gcdInner(gcd.apply(null, args.slice(0, middle + 1)), gcd.apply(null, args.slice(middle + 1)));
};
})();
