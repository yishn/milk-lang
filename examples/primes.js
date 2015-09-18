var _, getPrimes, factorization;

/**
 * Gets all the primes below a certain integer
 * Naive implementation of the sieve of Eratosthenes
 * @param  int   limit    the limit
 * @return array          the list of all primes below limit
 */

getPrimes = function(limit) {
    var checklist, i, checked, list;

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
    list = checklist;
    for (i in list) {
        checked = list[i];
        if (!(!checked)) continue;
        var x;
        x = i;

        // Check all multiples of i

        while ((i * x) <= limit) {
            /*@16:13*/
            checklist[i * x] = true;
            x++;
        }
    }

    // Accumulate unchecked items

    return (function() {
        var r1, list1;
        r1 = [];
        list1 = checklist;
        for (i in list1) {
            checked = list1[i];
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
    var primes, p, list2, i1;
    /*@31:5*/
    if (number <= 1) {
        return [];
    }

    // Get primes

    primes = getPrimes(number);

    // Search for divisor

    list2 = _.enumerate(primes);
    for (i1 = 0; i1 < list2.length; i1++) {
        p = list2[i1];
        if (!(_.modulo(number, p) === 0)) continue;
        var result;

        // Recursively get factorization

        result = factorization(number / p);
        /*@40:9*/
        result.push(p);
        return result;
    }
}
console.log('Here is your prime factorization for 8733:');
console.log(factorization(8733));

//: 7787ms
