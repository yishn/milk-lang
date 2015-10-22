(function() {
var rationals, start, end, step, n;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
sign = function(x) {
    return x == 0 ? 0 : (x > 0 ? 1 : -1);
}
compose = function(x, y, c1, c2) {
    return function() {
        return x.call(c1, y.apply(c2, arguments));
    }
}
/*@3:1*/
// -*- javascript -*-
rationals = function(n) {
    var f;
    f = function(n) {
        if (n <= 1) {
            /*@6:13*/
            return n;
        } else if (modulo(n, 2) === 0) {
            return f(n / 2);
        } else {
            /*@10:13*/
            return f((n - 1) / 2) + f(((n - 1) / 2) + 1);
        };
    };
    return (f(n) + '/') + f(n + 1);
};
/*@14:1*/
start = 0;
end = 100;
step = (end === start) ? 1 : sign(end - start);
for (n = start; step > 0 ? n <= end : n >= end; n += step) {
    var r;
    /*@17:5*/
    // -*- javascript -*-
    compose((r = console).log, rationals, r, null)(n);
};
})();
