(function() {
enumerate = function(l) {
    var t = toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
/*@1:1*/
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
    /*@4:5*/
    navigate = function(pos, step) {
        var row, col;
        (function(ref) {
            row = ref[0];
            col = ref[1];
            return ref;
        })(pos);
        /*@7:9*/
        if (((col + step) >= 0) && ((col + step) < lines[row].length)) {
            return [row, col + step];
        } else if (((col + step) < 0) && (row > 0)) {
            pos = [row - 1, lines[row - 1].length - 1];
            /*@11:13*/
            return navigate(pos, (col + step) + 1);
        } else if (((col + step) >= lines[row].length) && ((row + 1) < lines.length)) {
            pos = [row + 1, 0];
            return navigate(pos, (col + step) - lines[row].length);
        } else {
            var l;
            /*@16:13*/
            (function(ref1) {
                l = ref1[ref1.length - 1];
                return ref1;
            })(lines);
            return [lines.length - 1, l.length - 1];
        };
    };
    /*@19:5*/
    return navigate([0, 0], offset, lines).map(function(x) {
        return x + 1;
    });
};
exports.commentate = function(js, milk, comments) {
    var lastReportedLine, lines, i2, l2, line, i, i3, l3, comment;
    /*@22:5*/
    lastReportedLine = -5;
    lines = js.split('\n');
    l2 = lines;
    for (i2 in l2) {
        line = l2[i2];
        i = parseInt(i2, 10);
        if (isNaN(i)) i = i2;
        var offset, indent, row, col;
        /*@26:9*/
        if (line.trim().indexOf('//OFFSET') !== 0) {
            continue;
        };
        offset = parseInt(line.trim().replace('//OFFSET', ''), 10);
        /*@29:9*/
        indent = line.match(/^\s*/)[0];
        (function(ref2) {
            row = ref2[0];
            col = ref2[1];
            return ref2;
        })(exports.offsetToLinePos(offset, milk));
        /*@31:9*/
        lines[i] = '';
        if ((i - lastReportedLine) > 5) {
            lines[i] = ((((indent + '/*@') + row) + ':') + col) + '*/';
            /*@35:13*/
            lastReportedLine = i;
        };
        while ((comments.length > 0) && (comments[0].offset <= offset)) {
            lines[i] += (('\n' + indent) + comments[0][1]);
            /*@39:13*/
            comments.splice(0, 1);
        };
    };
    l3 = enumerate(comments);
    for (i3 = 0; i3 < l3.length; i3++) {
        (function(ref3) {
            comment = ref3[1];
            return ref3;
        })(l3[i3]);
        /*@42:9*/
        lines.push(comment);
    };
    return lines.filter(function(x) {
        return x !== '';
    }).join('\n');
};
})();