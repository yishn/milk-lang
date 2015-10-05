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
        var self, i, l, v1, v2;
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
        l = enumerate(edges);
        for (i = 0; i < l.length; i++) {
            (function(r) {
                v1 = r[0];
                v2 = r[1];
                return r;
            })(l[i]);
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
        /*@15:9*/
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
        /*@18:9*/
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
        var self, i, l, x, y;
        self = this;
        /*@26:9*/
        l = enumerate(self._permute(v1, v2));
        for (i = 0; i < l.length; i++) {
            (function(r) {
                x = r[0];
                y = r[1];
                return r;
            })(l[i]);
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
        var self, i, l, w;
        self = this;
        /*@37:9*/
        l = enumerate(self.getNeighbors(v));
        for (i = 0; i < l.length; i++) {
            w = l[i];
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
            var r, start, end, step, x;
            r = [];
            start = 1;
            end = width;
            step = (end === start) ? 1 : Math.sign(end - start);
            for (x = start; step > 0 ? x <= end : x >= end; x += step) {
                var start1, end1, step1, y;
                start1 = 1;
                end1 = height;
                step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
                for (y = start1; step1 > 0 ? y <= end1 : y >= end1; y += step1) {
                    r.push([x, y]);
                };
            };
            return r;
        })();
        /*@45:9*/
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
        /*@47:9*/
        self.__super__.init.call(self, vertices, edges);
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
        /*@50:9*/
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };
    return init;
})();
labyrinth = new Labyrinth(10, 5);
/*@53:1*/
console.log(labyrinth.getNeighbors([3, 3]));
})();
