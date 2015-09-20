(function() {
var _ = {}, getPrimes, factorization;
_.modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
_.enumerate = function(l) {
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
    var checklist, i, checked, l;

    // Initialize checklist
    checklist = (function() {
        var r, i, start, end, step;
        r = [];
        start = 0;
        end = limit;
        step = (end === start) ? 1 : Math.sign(end - start);
        for (i = start; step > 0 ? i <= end : i >= end; i += step) {
            r.push(false);
        }
        return r;
    })();
    /*@10:5*/
    checklist[0] = checklist[1] = true;
    l = checklist;
    for (i in l) {
        checked = l[i];
        if (!(!checked)) continue;
        var j, start1, end1, step1;
        /*@14:9*/
        // Check all multiples of i
        start1 = i * i;
        end1 = limit;
        step1 = ((i + 1) * i) - start1;
        for (j = start1; step1 > 0 ? j <= end1 : j >= end1; j += step1) {
            checklist[j] = true;
        }
    }
    /*@18:5*/
    // Accumulate unchecked items
    return (function() {
        var r1, l1;
        r1 = [];
        l1 = checklist;
        for (i in l1) {
            checked = l1[i];
            if (!(!checked)) continue;
            r1.push(i);
        }
        return r1;
    })();
}
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
    var primes, p, l2, i1;
    if (number <= 1) {
        return [];
    }
    /*@32:5*/
    // Get primes
    primes = getPrimes(number);

    // Search for divisor
    l2 = _.enumerate(primes);
    for (i1 = 0; i1 < l2.length; i1++) {
        p = l2[i1];
        if (!(_.modulo(number, p) === 0)) continue;
        var result;
        /*@37:9*/
        // Recursively get factorization
        result = factorization(number / p);
        result.push(p);
        return result;
    }
}
/*@41:1*/
console.log('Here is your prime factorization for 8733:');
console.log(factorization(8733));
})();

//: 9937ms
