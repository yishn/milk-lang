(function() {
var Graph, Labyrinth, labyrinth;
sign = function(x) {
    return x == 0 ? 0 : (x > 0 ? 1 : -1);
}
enumerate = function(l) {
    var t = Object.prototype.toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
inOp = function(x, l) {
    var t = Object.prototype.toString.call(l);
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
    x.__super__ = y.prototype;
    x.__super__.init = y.prototype.constructor;
    return x;
}
/*@3:1*/
// -*- javascript -*-
Graph = (function() {
    var init;
    init = function(vertices, edges) {
        var self, i, l, v1, v2;
        self = this;
        /*@5:9*/
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
        /*@7:9*/
        l = enumerate(edges);
        for (i = 0; i < l.length; i++) {
            (function(r) {
                v1 = r[0];
                v2 = r[1];
                return r;
            })(l[i]);
            /*@8:13*/
            self.addEdge(v1, v2);
        };
    };
    init.prototype._permute = function(v1, v2) {
        var self;
        self = this;
        /*@11:9*/
        return [[v1, v2], [v2, v1]];
    };
    init.prototype.getVertices = function() {
        var self;
        self = this;
        /*@14:9*/
        return (function() {
            var r, i, l, v;
            r = [];
            l = enumerate(self._adjacencyList);
            for (i = 0; i < l.length; i++) {
                v = l[i];
                r.push(v);
            };
            return r;
        })();
    };
    init.prototype.getNeighbors = function(v) {
        var self, r;
        self = this;
        /*@17:9*/
        return (function() {
            var r1;
            r1 = (function() {
                var r2;
                r2 = r = self._adjacencyList[v];
                if (((typeof r2) === 'undefined') || (r2 == null)) {
                    return null;
                };
                return r2.slice;
            })();
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1.call(r, 0);
        })();
    };
    init.prototype.addEdge = function(v1, v2) {
        var self, i, l, x, y;
        self = this;
        /*@20:9*/
        if (self.hasEdge(v1, v2)) {
            return;
        };
        l = enumerate(self._permute(v1, v2));
        for (i = 0; i < l.length; i++) {
            (function(r) {
                x = r[0];
                y = r[1];
                return r;
            })(l[i]);
            /*@22:13*/
            self._adjacencyList[x].push(y);
        };
    };
    init.prototype.hasEdge = function(v1, v2) {
        var self;
        self = this;
        /*@25:9*/
        return inOp(v2, self._adjacencyList[v1]);
    };
    init.prototype.removeEdge = function(v1, v2) {
        var self, i, l, x, y;
        self = this;
        /*@28:9*/
        l = enumerate(self._permute(v1, v2));
        for (i = 0; i < l.length; i++) {
            (function(r) {
                x = r[0];
                y = r[1];
                return r;
            })(l[i]);
            /*@29:13*/
            self._adjacencyList[x] = self._adjacencyList[x].filter(function(x) {
                return x !== y;
            });
        };
    };
    init.prototype.addVertex = function(v) {
        var self;
        self = this;
        /*@32:9*/
        if (!inOp(v, self._adjacencyList)) {
            self._adjacencyList[v] = [];
        };
    };
    init.prototype.hasVertex = function(v) {
        var self;
        self = this;
        /*@36:9*/
        return inOp(v, self._adjacencyList);
    };
    init.prototype.removeVertex = function(v) {
        var self, i, l, w;
        self = this;
        /*@39:9*/
        l = enumerate(self.getNeighbors(v));
        for (i = 0; i < l.length; i++) {
            w = l[i];
            self.removeEdge(v, w);
        };
        /*@42:9*/
        delete self._adjacencyList[v];
    };
    return init;
})();
Labyrinth = (function() {
    var init;
    /*@45:5*/
    init = function(width, height) {
        var self, vertices, edges;
        self = this;
        vertices = (function() {
            var r, start, end, step, x;
            r = [];
            start = 1;
            end = width;
            step = (end === start) ? 1 : sign(end - start);
            for (x = start; step > 0 ? x <= end : x >= end; x += step) {
                var start1, end1, step1, y;
                start1 = 1;
                end1 = height;
                step1 = (end1 === start1) ? 1 : sign(end1 - start1);
                for (y = start1; step1 > 0 ? y <= end1 : y >= end1; y += step1) {
                    r.push([x, y]);
                };
            };
            return r;
        })();
        /*@47:9*/
        edges = (function() {
            var r, i, l, v;
            r = [];
            l = enumerate(vertices);
            for (i = 0; i < l.length; i++) {
                v = l[i];
                var i1, l1, w;
                l1 = enumerate(vertices);
                for (i1 = 0; i1 < l1.length; i1++) {
                    w = l1[i1];
                    if (!(self.distance(v, w) === 1)) continue;
                    r.push([v, w]);
                };
            };
            return r;
        })();
        /*@49:9*/
        Labyrinth.__super__.init.call(self, vertices, edges);
    };
    extend(init, Graph);
    init.prototype.distance = function() {
        var x1, y1, x2, y2, self;
        (function(r) {
            (function(r1) {
                x1 = r1[0];
                y1 = r1[1];
                return r1;
            })(r[0]);
            (function(r1) {
                x2 = r1[0];
                y2 = r1[1];
                return r1;
            })(r[1]);
            return r;
        })(arguments);
        self = this;
        /*@52:9*/
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };
    return init;
})();
labyrinth = new Labyrinth(10, 5);
/*@55:1*/
console.log(labyrinth.getNeighbors([3, 3]));
})();
