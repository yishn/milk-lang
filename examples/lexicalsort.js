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
        x = ref[0];
        xs = (1 >= ref.length) ? [] : [].slice.call(ref, 1);
        return ref;
    })(xs);
    /*@5:20*/
    (function(ref1) {
        y = ref1[0];
        ys = (1 >= ref1.length) ? [] : [].slice.call(ref1, 1);
        return ref1;
    })(ys);
    /*@6:5*/
    return (x < y) ? (-1) : ((x > y) ? 1 : lexicalSort(xs, ys));
};
})();
//: 38ms
