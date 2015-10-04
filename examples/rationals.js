(function() {
var rationals, start, end, step, n;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
compose = function(x, y, c1, c2) {
    return function() {
        return x.call(c1, y.apply(c2, arguments));
    }
}
/*@1:1*/
rationals = function(n) {
    var f;
    f = function(n) {
        if (n <= 1) {
            /*@4:13*/
            return n;
        } else if (modulo(n, 2) === 0) {
            return f(n / 2);
        } else {
            /*@8:13*/
            return f((n - 1) / 2) + f(((n - 1) / 2) + 1);
        };
    };
    return (f(n) + '/') + f(n + 1);
};
/*@12:1*/
start = 0;
end = 100;
step = (end === start) ? 1 : Math.sign(end - start);
for (n = start; step > 0 ? n <= end : n >= end; n += step) {
    var r;
    /*@13:5*/
    compose((r = console).log, rationals, r, null)(n);
};
})();
