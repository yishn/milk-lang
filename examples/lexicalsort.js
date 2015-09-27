(function() {
var _ = {}, lexicalSort;

/*@1:1*/
lexicalSort = function(xs, ys) {
    var x, y;
    /*@2:5*/
    if ((!xs.length) || (!ys.length)) {
        /*@3:9*/
        return xs.length - ys.length;
    };
    /*@5:5*/
    (function(ref) {
        (function(ref1) {
            x = ref1[0];
            xs = (1 >= ref1.length) ? [] : [].slice.call(ref1, 1);
            return ref1;
        })(ref[0]);
        (function(ref2) {
            y = ref2[0];
            ys = (1 >= ref2.length) ? [] : [].slice.call(ref2, 1);
            return ref2;
        })(ref[1]);
        return ref;
    })([xs, ys]);
    /*@6:5*/
    return (x < y) ? (-1) : ((x > y) ? 1 : lexicalSort(xs, ys));
};
})();
//: 46ms
