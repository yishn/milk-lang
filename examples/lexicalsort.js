(function() {
var _ = {}, lexicalSort;

/*@1:1*/
lexicalSort = function(xxs, yys) {
    var x, xs, y, ys;
    /*@2:5*/
    if ((!xxs.length) || (!yys.length)) {
        /*@3:9*/
        return xxs.length - yys.length;
    };
    /*@5:5*/
    (function(ref) {
        x = ref[0];
        xs = (1 >= ref.length) ? [] : [].slice.call(ref, 1);
        return ref;
    })(xxs);
    /*@6:5*/
    (function(ref1) {
        y = ref1[0];
        ys = (1 >= ref1.length) ? [] : [].slice.call(ref1, 1);
        return ref1;
    })(yys);
    /*@7:5*/
    return (x < y) ? (-1) : ((x > y) ? 1 : lexicalSort(xs, ys));
};
})();
//: 46ms
