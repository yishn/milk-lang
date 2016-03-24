(function() {
var getPrimes, factorization;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
sign = function(x) {
    return x == 0 ? 0 : (x > 0 ? 1 : -1);
}
enumerate = function(l) {
    var t = Object.prototype.toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
/*@3:1*/
// -*- javascript -*-
/**
 * Gets all the primes below a certain integer
 * Naive implementation of the sieve of Eratosthenes
 * @param  int   limit    the limit
 * @return array          the list of all primes below limit
 */;
/*@9:1*/
getPrimes = function(limit) {
    var checklist, i1, l, checked, i;

    // Initialize checklist
    checklist = (function() {
        var r, start, end, step, i;
        r = [];
        start = 0;
        end = limit;
        step = (end === start) ? 1 : sign(end - start);
        for (i = start; step > 0 ? i <= end : i >= end; i += step) {
            r.push(false);
        };
        return r;
    })();
    /*@12:5*/
    checklist[0] = checklist[1] = true;
    l = checklist;
    for (i1 in l) {
        checked = l[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(!checked)) continue;
        var start, end, step, j;
        /*@16:9*/
        // Check all multiples of i
        start = i * i;
        end = limit;
        step = ((i + 1) * i) - start;
        for (j = start; step > 0 ? j <= end : j >= end; j += step) {
            checklist[j] = true;
        };
    };
    /*@20:5*/
    // Accumulate unchecked items
    return (function() {
        var r;
        r = [];
        l = checklist;
        for (i1 in l) {
            checked = l[i1];
            i = +i1;
            if (isNaN(i)) i = i1;
            if (!(!checked)) continue;
            r.push(i);
        };
        return r;
    })();
};
/*@22:1*/
/**
 * Factorizes a given number in its unique prime
 * number factorization
 * @param  int   number    the number
 * @return array           a list of ascending numbers,
 *                         the unique prime factorization
 *                         of number
 */;
/*@30:1*/
factorization = function(number) {
    var primes, i1, l, p;
    if (number <= 1) {
        return [];
    };
    /*@33:5*/
    primes = getPrimes(number);
    l = enumerate(primes);
    for (i1 = 0; i1 < l.length; i1++) {
        p = l[i1];
        if (!(modulo(number, p) === 0)) continue;
        /*@34:41*/
        break;
    };
    return (function() {
        var r, x;
        r = [];
        r.push(p);
        l = enumerate(factorization(number / p));
        for (i1 = 0; i1 < l.length; i1++) {
            x = l[i1];
            r.push(x);
        };
        return r;
    })();
};
/*@38:1*/
console.log('Here is your prime factorization for 8733:');
console.log(factorization(8733));
})();
