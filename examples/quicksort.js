(function() {
var quicksort;
enumerate = function(l) {
    var t = toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
/*@1:1*/
quicksort = function(list) {
    var pivot, rest, smaller, bigger;
    if (list.length === 0) {
        return [];
    };
    /*@4:5*/
    (function(r) {
        pivot = r[0];
        rest = (1 >= r.length) ? [] : [].slice.call(r, 1);
        return r;
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
        var r, i, l, x1, x2;
        r = [];
        l = enumerate(smaller);
        for (i = 0; i < l.length; i++) {
            x1 = l[i];
            r.push(x1);
        };
        r.push(pivot);
        l = enumerate(bigger);
        for (i = 0; i < l.length; i++) {
            x2 = l[i];
            r.push(x2);
        };
        return r;
    })();
};
/*@10:1*/
console.log(quicksort([453, 45, 234, 46, 34, 4, 24, 56]));
})();
