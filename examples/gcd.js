(function() {
var gcd;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
enumerate = function(l) {
    var t = toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
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
    return gcdInner(gcd.apply(this, (function() {
        var r, i1, l, x;
        r = [];
        l = enumerate(args.slice(0, middle + 1));
        for (i1 = 0; i1 < l.length; i1++) {
            x = l[i1];
            r.push(x);
        };
        return r;
    })()), gcd.apply(this, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(args.slice(middle + 1));
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        return r1;
    })()));
};
})();