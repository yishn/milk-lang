(function() {
enumerate = function(l) {
    var t = Object.prototype.toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
/*@3:1*/
// -*- javascript -*-
exports.offsetToLinePos = function(offset, input) {
    var lines, navigate;
    lines = (function() {
        var r, i1, l1, x;
        r = [];
        l1 = enumerate(input.split('\n'));
        for (i1 = 0; i1 < l1.length; i1++) {
            x = l1[i1];
            r.push(x + '\n');
        };
        return r;
    })();
    /*@6:5*/
    navigate = function(pos, step) {
        var row, col;
        (function(r) {
            row = r[0];
            col = r[1];
            return r;
        })(pos);
        /*@9:9*/
        if (((col + step) >= 0) && ((col + step) < lines[row].length)) {
            return [row, col + step];
        } else if (((col + step) < 0) && (row > 0)) {
            pos = [row - 1, lines[row - 1].length - 1];
            /*@13:13*/
            return navigate(pos, (col + step) + 1);
        } else if (((col + step) >= lines[row].length) && ((row + 1) < lines.length)) {
            pos = [row + 1, 0];
            return navigate(pos, (col + step) - lines[row].length);
        } else {
            var l;
            /*@18:13*/
            (function(r) {
                l = r[r.length - 1];
                return r;
            })(lines);
            return [lines.length - 1, l.length - 1];
        };
    };
    /*@21:5*/
    return navigate([0, 0], offset, lines).map(function(x) {
        return x + 1;
    });
};
exports.commentate = function(js, milk, comments) {
    var lastReportedLine, lines, i1, l1, comment, line, i;
    /*@24:5*/
    lastReportedLine = -5;
    lines = js.split('\n');
    l1 = enumerate(comments);
    for (i1 = 0; i1 < l1.length; i1++) {
        (function(r) {
            comment = r[1];
            return r;
        })(l1[i1]);
        if (!(comment[0] === '#')) continue;
        /*@28:9*/
        lines.splice(0, 0, comment);
    };
    comments = comments.filter(function() {
        var x;
        (function(r) {
            (function(r1) {
                x = r1[1];
                return r1;
            })(r[0]);
            return r;
        })(arguments);
        return x[0] !== '#';
    });
    /*@32:5*/
    l1 = lines;
    for (i1 in l1) {
        line = l1[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        var offset, indent, row, col;
        /*@33:9*/
        if (line.trim().indexOf('//OFFSET') !== 0) {
            continue;
        };
        offset = parseInt(line.trim().replace('//OFFSET', ''), 10);
        /*@36:9*/
        indent = line.match(/^\s*/)[0];
        (function(r) {
            row = r[0];
            col = r[1];
            return r;
        })(exports.offsetToLinePos(offset, milk));
        /*@38:9*/
        lines[i] = '';
        if ((i - lastReportedLine) > 5) {
            lines[i] = ((((indent + '/*@') + row) + ':') + col) + '*/';
            /*@42:13*/
            lastReportedLine = i;
        };
        while ((comments.length > 0) && (comments[0].offset <= offset)) {
            lines[i] += (('\n' + indent) + comments[0][1]);
            /*@46:13*/
            comments.splice(0, 1);
        };
    };
    l1 = enumerate(comments);
    for (i1 = 0; i1 < l1.length; i1++) {
        (function(r) {
            comment = r[1];
            return r;
        })(l1[i1]);
        /*@49:9*/
        lines.push(comment);
    };
    return lines.filter(function(x) {
        return x !== '';
    }).join('\n') + '\n';
};
})();
