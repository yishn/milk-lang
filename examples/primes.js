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
        var start1, end1, step1, j;
        /*@14:9*/
        // Check all multiples of i
        start1 = i * i;
        end1 = limit;
        step1 = ((i + 1) * i) - start1;
        for (j = start1; step1 > 0 ? j <= end1 : j >= end1; j += step1) {
            checklist[j] = true;
        };
    };
    /*@18:5*/
    // Accumulate unchecked items
    return (function() {
        var r1, i2, l1;
        r1 = [];
        l1 = checklist;
        for (i2 in l1) {
            checked = l1[i2];
            i = parseInt(i2, 10);
            if (isNaN(i)) i = i2;
            if (!(!checked)) continue;
            r1.push(i);
        };
        return r1;
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
    var primes, i3, l2, p;
    if (number <= 1) {
        return [];
    };
    /*@32:5*/
    // Get primes
    primes = getPrimes(number);

    // Search for divisor
    l2 = enumerate(primes);
    for (i3 = 0; i3 < l2.length; i3++) {
        p = l2[i3];
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
