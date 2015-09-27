(function() {
var _ = {}, gcd;
_.modulo = function(a, b) {
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
        return (b === 0) ? a : gcdInner(b, _.modulo(a, b));
    };
    /*@6:5*/
    middle = Math.floor((args.length - 1) / 2);
    return gcdInner(gcd.apply(this, (function() {
        var r;
        r = [];
        r.push.apply(r, args.slice(0, middle + 1));
        return r;
    })()), gcd.apply(this, (function() {
        var r1;
        r1 = [];
        r1.push.apply(r1, args.slice(middle + 1));
        return r1;
    })()));
};
})();
//: 54ms
