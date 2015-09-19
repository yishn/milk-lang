(function() {

var _, getPrimes, factorization;

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
        for (i = start; i <= end; i += step) {
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
        var x;
        /*@13:9*/
        x = i;

        // Check all multiples of i
        while ((i * x) <= limit) {
            checklist[i * x] = true;
            /*@17:13*/
            x++;
        }
    }

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
    /*@31:5*/
    if (number <= 1) {
        return [];
    }

    // Get primes
    primes = getPrimes(number);

    // Search for divisor
    l2 = _.enumerate(primes);
    for (i1 = 0; i1 < l2.length; i1++) {
        p = l2[i1];
        if (!(_.modulo(number, p) === 0)) continue;
        var result;

        // Recursively get factorization
        result = factorization(number / p);
        /*@40:9*/
        result.push(p);
        return result;
    }
}
/*@43:1*/
console.log('Here is your prime factorization for 8733:');
console.log(factorization(8733));

})();

//: 9258ms
