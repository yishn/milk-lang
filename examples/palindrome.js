(function() {
var palindrome;
/*@3:1*/
// -*- javascript -*-
palindrome = function(input) {
    var first, rest, last;
    if (input.length === 0) {
        return true;
    };
    /*@6:5*/
    (function(r) {
        first = r[0];
        rest = (1 >= (r.length - 1)) ? [] : [].slice.call(r, 1, -1);
        last = r[r.length - 1];
        return r;
    })(input);
    /*@7:5*/
    return (first === last) && palindrome(rest);
};
})();
