(function() {
var Graph, Labyrinth, labyrinth;
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
extend = function(x, y) {
    var copy = function() {};
    copy.prototype = y.prototype;
    var c = new copy();
    c.constructor = x;
    x.prototype = c;
    x.prototype.__super__ = y.prototype;
    x.prototype.__super__.init = y.prototype.constructor;
    return x;
}
/*@1:1*/
Graph = (function() {
    var init;
    init = function(vertices, edges) {
        var self, i1, l1, v1, v2;
        self = this;
        /*@3:9*/
        self._adjacencyList = (function() {
            var r, i, l, v;
            r = {};
            l = enumerate(vertices);
            for (i = 0; i < l.length; i++) {
                v = l[i];
                r[v] = [];
            };
            return r;
        })();
        /*@5:9*/
        l1 = enumerate(edges);
        for (i1 = 0; i1 < l1.length; i1++) {
            (function(r1) {
                v1 = r1[0];
                v2 = r1[1];
                return r1;
            })(l1[i1]);
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
            var r2, i2, l2, v;
            r2 = [];
            l2 = enumerate(self._adjacencyList);
            for (i2 = 0; i2 < l2.length; i2++) {
                v = l2[i2];
                r2.push(v);
            };
            return r2;
        })();
    };
    init.prototype.getNeighbors = function(v) {
        var self, r3;
        self = this;
        /*@15:9*/
        return (function() {
            var r4;
            r4 = (function() {
                var r5;
                r5 = r3 = self._adjacencyList[v];
                if (((typeof r5) === 'undefined') || (r5 == null)) {
                    return null;
                };
                return r5.slice;
            })();
            if (((typeof r4) === 'undefined') || (r4 == null)) {
                return null;
            };
            return r4.call(r3, 0);
        })();
    };
    init.prototype.addEdge = function(v1, v2) {
        var self, i3, l3, x, y;
        self = this;
        /*@18:9*/
        if (self.hasEdge(v1, v2)) {
            return;
        };
        l3 = enumerate(self._permute(v1, v2));
        for (i3 = 0; i3 < l3.length; i3++) {
            (function(r6) {
                x = r6[0];
                y = r6[1];
                return r6;
            })(l3[i3]);
            /*@20:13*/
            self._adjacencyList[x].push(y);
        };
    };
    init.prototype.hasEdge = function(v1, v2) {
        var self;
        self = this;
        /*@23:9*/
        return inOp(v2, self._adjacencyList[v1]);
    };
    init.prototype.removeEdge = function(v1, v2) {
        var self, i4, l4, x, y;
        self = this;
        /*@26:9*/
        l4 = enumerate(self._permute(v1, v2));
        for (i4 = 0; i4 < l4.length; i4++) {
            (function(r7) {
                x = r7[0];
                y = r7[1];
                return r7;
            })(l4[i4]);
            /*@27:13*/
            self._adjacencyList[x] = self._adjacencyList[x].filter(function(x) {
                return x !== y;
            });
        };
    };
    init.prototype.addVertex = function(v) {
        var self;
        self = this;
        /*@30:9*/
        if (!inOp(v, self._adjacencyList)) {
            self._adjacencyList[v] = [];
        };
    };
    init.prototype.hasVertex = function(v) {
        var self;
        self = this;
        /*@34:9*/
        return inOp(v, self._adjacencyList);
    };
    init.prototype.removeVertex = function(v) {
        var self, i5, l5, w;
        self = this;
        /*@37:9*/
        l5 = enumerate(self.getNeighbors(v));
        for (i5 = 0; i5 < l5.length; i5++) {
            w = l5[i5];
            self.removeEdge(v, w);
        };
        /*@40:9*/
        delete self._adjacencyList[v];
    };
    return init;
})();
Labyrinth = (function() {
    var init;
    /*@43:5*/
    init = function(width, height) {
        var self, vertices, edges;
        self = this;
        vertices = (function() {
            var r8, start, end, step, x;
            r8 = [];
            start = 1;
            end = width;
            step = (end === start) ? 1 : Math.sign(end - start);
            for (x = start; step > 0 ? x <= end : x >= end; x += step) {
                var start1, end1, step1, y;
                start1 = 1;
                end1 = height;
                step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
                for (y = start1; step1 > 0 ? y <= end1 : y >= end1; y += step1) {
                    r8.push([x, y]);
                };
            };
            return r8;
        })();
        /*@45:9*/
        edges = (function() {
            var r9, i6, l6, v;
            r9 = [];
            l6 = enumerate(vertices);
            for (i6 = 0; i6 < l6.length; i6++) {
                v = l6[i6];
                var i7, l7, w;
                l7 = enumerate(vertices);
                for (i7 = 0; i7 < l7.length; i7++) {
                    w = l7[i7];
                    if (!(self.distance(v, w) === 1)) continue;
                    r9.push([v, w]);
                };
            };
            return r9;
        })();
        /*@47:9*/
        self.__super__.init.call(self, vertices, edges);
    };
    extend(init, Graph);
    init.prototype.distance = function() {
        var x1, y1, x2, y2, self;
        (function(r10) {
            (function(r11) {
                x1 = r11[0];
                y1 = r11[1];
                return r11;
            })(r10[0]);
            (function(r12) {
                x2 = r12[0];
                y2 = r12[1];
                return r12;
            })(r10[1]);
            return r10;
        })(arguments);
        self = this;
        /*@50:9*/
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };
    return init;
})();
labyrinth = new Labyrinth(10, 5);
/*@53:1*/
console.log(labyrinth.getNeighbors([3, 3]));
})();
