(function() {
var palindrome;
/*@1:1*/
palindrome = function(input) {
    var first, rest, last;
    if (input.length === 0) {
        return true;
    };
    /*@4:5*/
    (function(ref) {
        first = ref[0];
        rest = (1 >= (ref.length - 1)) ? [] : [].slice.call(ref, 1, -1);
        last = ref[ref.length - 1];
        return ref;
    })(input);
    /*@5:5*/
    return (first === last) && palindrome(rest);
};
})();