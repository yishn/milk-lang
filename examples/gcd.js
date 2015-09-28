(function() {
var gcd;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
/*@1:1*/
gcd = function() {
    var args, gcdInner, middle;
    (function(ref) {
        args = (0 >= ref.length) ? [] : [].slice.call(ref, 0);
        return ref;
    })(arguments);
    /*@2:5*/
    if (args.length === 1) {
        return args[0];
    };
    gcdInner = function(a, b) {
        return (b === 0) ? a : gcdInner(b, modulo(a, b));
    };
    /*@6:5*/
    middle = Math.floor((args.length - 1) / 2);
    return gcdInner(gcd.apply(this, args.slice(0, middle + 1)), gcd.apply(this, args.slice(middle + 1)));
};
})();
