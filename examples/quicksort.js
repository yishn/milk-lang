(function() {
var _ = {}, quicksort;
/*@1:1*/
quicksort = function(list) {
    var pivot, rest, smaller, bigger;
    if (list.length === 0) {
        return [];
    };
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
    return (function() {
        var r;
        r = [];
        r.push.apply(r, smaller);
        r.push(pivot);
        r.push.apply(r, bigger);
        return r;
    })();
};
/*@10:1*/
console.log(quicksort([453, 45, 234, 46, 34, 4, 24, 56]));
})();
//: 53ms
