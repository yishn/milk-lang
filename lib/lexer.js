(function() {
var escaperegex, regexmap, gcd, removeNewline, rules;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
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
equals = function(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a == b;
    var t = Object.prototype.toString.call(a);
    if (t !== Object.prototype.toString.call(b)) return false;
    var aa = t === "[object Array]";
    var ao = t === "[object Object]";
    if (aa) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++)
            if (!equals(a[i], b[i])) return false;
        return true;
    } else if (ao) {
        var kk = Object.keys(a);
        if (kk.length !== Object.keys(b).length) return false;
        for (var i = 0; i < kk.length; i++) {
            k = kk[i];
            if (!(k in b)) return false;
            if (!equals(a[k], b[k])) return false;
        }
        return true;
    }
    return false;
}
/*@3:1*/
// -*- javascript -*-
escaperegex = function(x) {
    return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
regexmap = function(l) {
    return l.map(function(x) {
        return new RegExp('^' + escaperegex(x));
    });
};
/*@6:1*/
gcd = function() {
    var args, gcdInner, middle;
    (function(r) {
        args = (0 >= r.length) ? [] : [].slice.call(r, 0);
        return r;
    })(arguments);
    /*@7:5*/
    if (args.length <= 1) {
        return (function() {
            var r;
            r = args[0];
            if (((typeof r) === 'undefined') || (r == null)) {
                return 1;
            };
            return r;
        })();
    };
    /*@9:5*/
    gcdInner = function(a, b) {
        return (b === 0) ? a : gcdInner(b, modulo(a, b));
    };
    middle = Math.floor((args.length - 1) / 2);
    /*@12:5*/
    return gcdInner(gcd.apply(null, args.slice(0, middle + 1)), gcd.apply(null, args.slice(middle + 1)));
};
removeNewline = function(tokens, i) {
    var depth, i1, l1, token, k;
    /*@15:5*/
    if (equals(tokens[i], ['newline', 'nodent'])) {
        tokens[i] = null;
        return;
    };
    /*@19:5*/
    depth = 0;
    l1 = tokens;
    for (i1 in l1) {
        token = l1[i1];
        k = parseInt(i1, 10);
        if (isNaN(k)) k = i1;
        if (!((k >= i) && (token != null))) continue;
        var type, value;
        /*@21:9*/
        (function(r) {
            type = r[0];
            value = r[1];
            return r;
        })(token);
        /*@22:9*/
        if (type !== 'newline') {
            continue;
        };
        if (value === 'indent') {
            /*@24:31*/
            depth++;
        } else if (value === 'dedent') {
            depth--;
        };
        /*@27:9*/
        if (k === i) {
            tokens[k] = null;
        } else if (depth === 0) {
            tokens[k] = ['newline', 'nodent'];
            /*@31:13*/
            return;
        };
    };
};
rules = {
    operator: regexmap(['*', '/', '^', '%', '-', '+', '@', '|', '=', '--', '++', '+=', '*=', '%=', '-=', '/=', '=>', '??', '?', '||', '&&', '!', '<', '>', '<=', '>=', '==', '!=', 'in', 'not in', 'instanceof', 'typeof', 'new', 'equals', 'not equals', '.', '?.']).concat([/^\s+:\s+/]),
    delimiter: regexmap([';', ',', ':', '...']),
    leftdelimiter: regexmap(['(', '?(', '[', '?[', '{']),
    rightdelimiter: regexmap([')', ']', '}']),
    newline: [/^\n[^\S\n]*/],
    bool: regexmap(['true', 'false']),
    keyword: regexmap(['_', 'pass', 'equals', 'null', 'undefined', 'not', 'true', 'false', 'arguments', 'export', 'import', 'void', 'debugger', 'with', 'delete', 'var', 'let', 'const', 'typeof', 'new', 'class', 'extends', 'this', 'self', 'super', 'return', 'yield', 'function', 'if', 'else', 'else if', 'switch', 'case', 'default', 'do', 'while', 'break', 'continue', 'for', 'in', 'of', 'instanceof', 'try', 'catch', 'finally', 'throw', 'enum', 'implements', 'static', 'public', 'package', 'interface', 'protected', 'private', 'abstract', 'final', 'native', 'boolean', 'float', 'short', 'byte', 'goto', 'synchronized', 'char', 'int', 'transient', 'double', 'long', 'volatile']),
    identifier: [/^[a-zA-Z_$][0-9a-zA-Z_$]*/],
    number: [/^[0-9]+/, /^[0-9]*\.[0-9]+/, /^0x[0-9a-fA-F]+/],
    string: [/^"("|.*?[^\\]"|.*?\\\\")/, /^'('|.*?[^\\]'|.*?\\\\')/],
    regex: [/^\/([^\/*]\/|.*?[^\\]\/|.*?\\\\\/)[gim]*/],
    comment: [/^\/\/.*/, /^#.*/, /^\/\*[^]*?\*\//],
    ignore: [/^[^\S\n]+/, /^#[A-Z]+/]
};
/*@116:1*/
exports.tokenize = function(input) {
    var residue, offset, tokens, output, indents, indentLength, lastDepth, useTabs, i1, l1, type, value, i, start, end, step, token, indent;
    (function(r) {
        residue = r[0];
        offset = r[1];
        return r;
    })([input, 0]);
    /*@118:5*/
    tokens = [];

    // Tokenizer
    while (residue.length > 0) {
        var lastType, type, value, i1, l1, list, t;
        lastType = null;
        /*@123:9*/
        (function(r) {
            type = r[0];
            value = r[1];
            return r;
        })([null, '']);
        /*@124:9*/
        if (tokens.length > 0) {
            (function(r) {
                (function(r1) {
                    lastType = r1[0];
                    return r1;
                })(r[r.length - 1]);
                return r;
            })(tokens);
        };
        /*@126:9*/
        l1 = rules;
        for (i1 in l1) {
            list = l1[i1];
            t = parseInt(i1, 10);
            if (isNaN(t)) t = i1;
            var i2, l2, regex;
            /*@128:13*/
            // Check whether regex or division
            if ((t === 'regex') && (!inOp(lastType, ['keyword', 'operator', 'leftdelimiter', 'delimiter', 'newline', null]))) {
                continue;
            };
            l2 = enumerate(list);
            for (i2 = 0; i2 < l2.length; i2++) {
                regex = l2[i2];
                var matches;
                /*@133:17*/
                matches = regex.exec(residue);
                if ((matches == null) || (matches[0].length <= value.length)) {
                    continue;
                };
                /*@137:17*/
                (function(r) {
                    type = r[0];
                    value = r[1];
                    return r;
                })([t, matches[0]]);
            };
        };
        /*@140:9*/
        // No token found
        if (type == null) {
            throw {
                message: ("Syntax error: Unexpected '" + residue[0]) + "'",
                offset: offset
            };
        };
        /*@146:9*/
        // Don't add newline twice
        if (((type === 'newline') && (tokens.length > 0)) && (tokens[tokens.length - 1][0] === 'newline')) {
            tokens.pop();
        };
        if (type !== 'ignore') {
            var token;
            /*@150:13*/
            token = [type, value.trim()];
            if (token[1] === '') {
                token[1] = value;
            };
            /*@152:13*/
            token.offset = offset;
            tokens.push(token);
        };
        offset += value.length;
        /*@156:9*/
        residue = residue.slice(value.length);
    };
    output = [];

    // Detect indents & dedents
    indents = (function() {
        var r, i1, l1, t, x;
        r = [];
        l1 = enumerate(tokens);
        for (i1 = 0; i1 < l1.length; i1++) {
            (function(r1) {
                t = r1[0];
                x = r1[1];
                return r1;
            })(l1[i1]);
            if (!(t === 'newline')) continue;
            r.push(x.length - 1);
        };
        return r;
    })();
    /*@162:5*/
    indentLength = gcd.apply(null, indents.filter(function(x) {
        return x !== 0;
    }));
    (function(r) {
        lastDepth = r[0];
        useTabs = r[1];
        return r;
    })([0, null]);
    /*@165:5*/
    l1 = tokens;
    for (i1 in l1) {
        (function(r) {
            type = r[0];
            value = r[1];
            return r;
        })(l1[i1]);
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        var depth;
        /*@166:9*/
        if (type !== 'newline') {
            output.push(tokens[i]);
            continue;
        };
        /*@170:9*/
        depth = (value.length - 1) / indentLength;
        if (depth !== 0) {

            // Check for mixed indentation
            if (useTabs == null) {
                /*@175:17*/
                useTabs = inOp('\t', value);
            } else if (useTabs !== (inOp('\t', value))) {
                throw {
                    message: 'Mixed indentation',
                    offset: tokens[i].offset
                };
            };
        };
        /*@182:9*/
        if (depth !== lastDepth) {
            var start, end, step, x1;
            start = 1;
            end = Math.abs(depth - lastDepth);
            step = 2 - start;
            for (x1 = start; step > 0 ? x1 <= end : x1 >= end; x1 += step) {
                var token;
                /*@184:17*/
                token = ['newline', (depth > lastDepth) ? 'indent' : 'dedent'];
                token.offset = tokens[i].offset;
                output.push(token);
            };
        } else {
            /*@188:13*/
            output.push(['newline', 'nodent']);
        };
        lastDepth = depth;
    };
    /*@192:5*/
    start = 1;
    end = lastDepth;
    step = 2 - start;
    for (i = start; step > 0 ? i <= end : i >= end; i += step) {
        output.push(['newline', 'dedent']);
    };
    /*@196:5*/
    // Remove superfluous newlines
    l1 = output;
    for (i1 in l1) {
        token = l1[i1];
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        if (!((function() {
        if (((typeof token) === 'undefined') || (token == null)) {
            return null;
        };
        return token[0];
    })() === 'operator')) continue;
        /*@197:9*/
        if (inOp(token[1], ['++', '--', 'typeof', 'new'])) {
            continue;
        };
        if (((function() {
            var r;
            r = output[i - 1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return null;
            };
            return r[0];
        })() === 'newline') && ((function() {
            var r;
            r = output[i - 1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return null;
            };
            return r[1];
        })() !== 'dedent')) {
            /*@201:13*/
            removeNewline(output, i - 1);
        };
        if (((function() {
            var r;
            r = output[i + 1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return null;
            };
            return r[0];
        })() === 'newline') && ((function() {
            var r;
            r = output[i + 1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return null;
            };
            return r[1];
        })() !== 'dedent')) {
            /*@203:13*/
            removeNewline(output, i + 1);
        };
    };
    indent = ((function() {
        var r, x1;
        r = [];
        start = 1;
        end = indentLength;
        step = (end === start) ? 1 : sign(end - start);
        for (x1 = start; step > 0 ? x1 <= end : x1 >= end; x1 += step) {
            r.push(useTabs ? '\t' : ' ');
        };
        return r;
    })()).join('');
    /*@206:5*/
    return [output.filter(function(x) {
        return x != null;
    }), indent];
};
})();
