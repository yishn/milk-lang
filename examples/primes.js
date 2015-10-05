(function() {
var getPrimes, factorization;
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
/*@7:1*/
/**
 * Gets all the primes below a certain integer
 * Naive implementation of the sieve of Eratosthenes
 * @param  int   limit    the limit
 * @return array          the list of all primes below limit
 */
getPrimes = function(limit) {
    var checklist, i1, l, checked, i;

    // Initialize checklist
    checklist = (function() {
        var r, start, end, step, i;
        r = [];
        start = 0;
        end = limit;
        step = (end === start) ? 1 : Math.sign(end - start);
        for (i = start; step > 0 ? i <= end : i >= end; i += step) {
            r.push(false);
        };
        return r;
    })();
    /*@10:5*/
    checklist[0] = checklist[1] = true;
    l = checklist;
    for (i1 in l) {
        checked = l[i1];
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        if (!(!checked)) continue;
        var start, end, step, j;
        /*@14:9*/
        // Check all multiples of i
        start = i * i;
        end = limit;
        step = ((i + 1) * i) - start;
        for (j = start; step > 0 ? j <= end : j >= end; j += step) {
            checklist[j] = true;
        };
    };
    /*@18:5*/
    // Accumulate unchecked items
    return (function() {
        var r;
        r = [];
        l = checklist;
        for (i1 in l) {
            checked = l[i1];
            i = parseInt(i1, 10);
            if (isNaN(i)) i = i1;
            if (!(!checked)) continue;
            r.push(i);
        };
        return r;
    })();
};
/*@28:1*/
/**
 * Factorizes a given number in its unique prime
 * number factorization
 * @param  int   number    the number
 * @return array           a list of descending numbers,
 *                         the unique prime factorization
 *                         of number
 */
factorization = function(number) {
    var primes, i1, l, p;
    if (number <= 1) {
        return [];
    };
    /*@32:5*/
    // Get primes
    primes = getPrimes(number);

    // Search for divisor
    l = enumerate(primes);
    for (i1 = 0; i1 < l.length; i1++) {
        p = l[i1];
        if (!(modulo(number, p) === 0)) continue;
        var result;
        /*@37:9*/
        // Recursively get factorization
        result = factorization(number / p);
        result.push(p);
        return result;
    };
};
/*@41:1*/
console.log('Here is your prime factorization for 8733:');
console.log(factorization(8733));
})();
