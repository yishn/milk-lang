(function() {
var lexicalSort;
/*@3:1*/
// -*- javascript -*-
lexicalSort = function(xs, ys) {
    var x, y;
    if ((!xs.length) || (!ys.length)) {
        return xs.length - ys.length;
    };
    /*@7:5*/
    (function(r) {
        (function(r1) {
            x = r1[0];
            xs = (1 >= r1.length) ? [] : [].slice.call(r1, 1);
            return r1;
        })(r[0]);
        (function(r1) {
            y = r1[0];
            ys = (1 >= r1.length) ? [] : [].slice.call(r1, 1);
            return r1;
        })(r[1]);
        return r;
    })([xs, ys]);
    /*@8:5*/
    return (x < y) ? (-1) : ((x > y) ? 1 : lexicalSort(xs, ys));
};
})();
