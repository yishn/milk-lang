(function() {
var levenshtein;
enumerate = function(l) {
    var t = toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
/*@3:1*/
// -*- javascript -*-
levenshtein = function(a, b) {
    var i1, l, x, y, matrix, start, end, step, i;
    l = enumerate([[a, b], [b, a]]);
    for (i1 = 0; i1 < l.length; i1++) {
        (function(r) {
            x = r[0];
            y = r[1];
            return r;
        })(l[i1]);
        if (!(x.length === 0)) continue;
        /*@5:9*/
        return y.length;
    };

    // Initialize matrix
    matrix = (function() {
        var r, start, end, step, i;
        r = [];
        start = 0;
        end = b.length;
        step = (end === start) ? 1 : Math.sign(end - start);
        for (i = start; step > 0 ? i <= end : i >= end; i += step) {
            r.push([i]);
        };
        return r;
    })();
    /*@9:5*/
    matrix[0] = (function() {
        var r, start, end, step, j;
        r = [];
        start = 0;
        end = a.length;
        step = (end === start) ? 1 : Math.sign(end - start);
        for (j = start; step > 0 ? j <= end : j >= end; j += step) {
            r.push(j);
        };
        return r;
    })();
    /*@11:5*/
    start = 1;
    end = b.length;
    step = (end === start) ? 1 : Math.sign(end - start);
    for (i = start; step > 0 ? i <= end : i >= end; i += step) {
        var start1, end1, step1, j;
        /*@12:9*/
        start1 = 1;
        end1 = a.length;
        step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
        for (j = start1; step1 > 0 ? j <= end1 : j >= end1; j += step1) {
            if (b[i - 1] === a[j - 1]) {
                /*@14:17*/
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            };
        };
    };
    /*@18:5*/
    return matrix[b.length][a.length];
};
})();
