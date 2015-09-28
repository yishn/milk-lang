(function() {
var Graph, space, graph;
enumerate = function(l) {
    var t = toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
inOp = function(x, l) {
    var t = toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return x in l;
    return l.indexOf(x) != -1;
}
/*@1:1*/
Graph = (function() {
    var init;
    init = function() {
        var vertices, edges, self, i3, l1, v1, v2;
        (function(ref) {
            vertices = ref[0];
            edges = (1 >= ref.length) ? [] : [].slice.call(ref, 1);
            return ref;
        })(arguments);
        self = this;
        /*@3:9*/
        self._adjacencyList = (function() {
            var r, i2, l, v;
            r = {};
            l = enumerate(vertices);
            for (i2 = 0; i2 < l.length; i2++) {
                v = l[i2];
                r[v] = [];
            };
            return r;
        })();
        /*@5:9*/
        l1 = enumerate(edges);
        for (i3 = 0; i3 < l1.length; i3++) {
            (function(ref1) {
                v1 = ref1[0];
                v2 = ref1[1];
                return ref1;
            })(l1[i3]);
            /*@6:13*/
            self.addEdge(v1, v2);
        };
    };
    init.prototype._permute = function(v1, v2) {
        var self;
        self = this;
        /*@9:9*/
        return [[v1, v2], [v2, v1]];
    };
    init.prototype.getVertices = function() {
        var self;
        self = this;
        /*@12:9*/
        return (function() {
            var r1, i4, l2, v;
            r1 = [];
            l2 = enumerate(self._adjacencyList);
            for (i4 = 0; i4 < l2.length; i4++) {
                v = l2[i4];
                r1.push(v);
            };
            return r1;
        })();
    };
    init.prototype.getNeighbors = function(v) {
        var self;
        self = this;
        /*@15:9*/
        return self._adjacencyList[v];
    };
    init.prototype.addEdge = function(v1, v2) {
        var self, i5, l3, x, y;
        self = this;
        /*@18:9*/
        l3 = enumerate(self._permute(v1, v2));
        for (i5 = 0; i5 < l3.length; i5++) {
            (function(ref2) {
                x = ref2[0];
                y = ref2[1];
                return ref2;
            })(l3[i5]);
            /*@19:13*/
            self._adjacencyList[x].push(y);
        };
    };
    init.prototype.hasEdge = function(v1, v2) {
        var self;
        self = this;
        /*@22:9*/
        return inOp(v2, self._adjacencyList[v1]);
    };
    init.prototype.removeEdge = function(v1, v2) {
        var self, i6, l4, x, y;
        self = this;
        /*@25:9*/
        l4 = enumerate(self._permute(v1, v2));
        for (i6 = 0; i6 < l4.length; i6++) {
            (function(ref3) {
                x = ref3[0];
                y = ref3[1];
                return ref3;
            })(l4[i6]);
            /*@26:13*/
            self._adjacencyList[x] = self._adjacencyList[x].filter(function(x) {
                return x !== y;
            });
        };
    };
    init.prototype.addVertex = function(v) {
        var self;
        self = this;
        /*@29:9*/
        if (!inOp(v, self._adjacencyList)) {
            self._adjacencyList[v] = [];
        };
    };
    init.prototype.hasVertex = function(v) {
        var self;
        self = this;
        /*@33:9*/
        return inOp(v, self._adjacencyList);
    };
    init.prototype.removeVertex = function(v) {
        var self, i7, l5, w;
        self = this;
        /*@36:9*/
        l5 = enumerate(self.getNeighbors(v));
        for (i7 = 0; i7 < l5.length; i7++) {
            w = l5[i7];
            self.removeEdge(v, w);
        };
        /*@39:9*/
        delete self._adjacencyList[v];
    };
    return init;
})();
space = (function() {
    var r2, start, end, step, i;
    r2 = [];
    start = 1;
    end = 3;
    step = (end === start) ? 1 : Math.sign(end - start);
    for (i = start; step > 0 ? i <= end : i >= end; i += step) {
        var start1, end1, step1, j;
        start1 = 1;
        end1 = 3;
        step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
        for (j = start1; step1 > 0 ? j <= end1 : j >= end1; j += step1) {
            r2.push((i + ',') + j);
        };
    };
    return r2;
})();
/*@42:1*/
graph = new Graph(space, ['1,1', '1,2'], ['1,1', '1,3'], ['1,1', '2,1'], ['1,1', '3,1']);
console.log(graph.getVertices());
console.log(graph.getNeighbors('1,1'));
/*@47:1*/
graph.removeVertex('1,3');
console.log(graph.getNeighbors('1,1'));
})();
