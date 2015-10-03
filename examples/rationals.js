(function() {
var rationals, start, end, step, n;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
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
    console.log(rationals(n));
};
})();
