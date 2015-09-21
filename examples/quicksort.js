(function() {
var _ = {}, quicksort;
/*@1:1*/
quicksort = function(list) {
    var pivot, rest, smaller, bigger;
    if (list.length === 0) {
        return [];
    }
    /*@4:5*/
    (function(ref) {
        pivot = ref[0];
        rest = (1 >= ref.length) ? [] : [].slice.call(ref, 1);
        return ref;
    })(list);
    /*@5:5*/
    smaller = quicksort(rest.filter(function(x) {
        return x <= pivot;
    }));
    bigger = quicksort(rest.filter(function(x) {
        return x > pivot;
    }));
    /*@8:5*/
    return smaller.concat([pivot]).concat(bigger);
}
})();

//: 1088ms
