(function() {
var escaperegex, regexmap, gcd, removeNewline, rules;
modulo = function(a, b) {
    var c = a % b;
    return c >= 0 ? c : c + b;
}
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
equals = function(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a == b;
    var t = toString.call(a);
    if (t !== toString.call(b)) return false;
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
/*@1:1*/
escaperegex = function(x) {
    return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
regexmap = function(l) {
    return l.map(function(x) {
        return new RegExp('^' + escaperegex(x));
    });
};
/*@4:1*/
gcd = function() {
    var args, gcdInner, middle;
    (function(ref) {
        args = (0 >= ref.length) ? [] : [].slice.call(ref, 0);
        return ref;
    })(arguments);
    /*@5:5*/
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
    /*@7:5*/
    gcdInner = function(a, b) {
        return (b === 0) ? a : gcdInner(b, modulo(a, b));
    };
    middle = Math.floor((args.length - 1) / 2);
    /*@10:5*/
    return gcdInner(gcd.apply(this, args.slice(0, middle + 1)), gcd.apply(this, args.slice(middle + 1)));
};
removeNewline = function(tokens, i) {
    var depth, i2, l1, token, k;
    /*@13:5*/
    if (equals(tokens[i], ['newline', 'nodent'])) {
        tokens[i] = null;
        return;
    };
    /*@17:5*/
    depth = 0;
    l1 = tokens;
    for (i2 in l1) {
        token = l1[i2];
        k = parseInt(i2, 10);
        if (isNaN(k)) k = i2;
        if (!((k >= i) && (token != null))) continue;
        var type, value;
        /*@19:9*/
        (function(ref1) {
            type = ref1[0];
            value = ref1[1];
            return ref1;
        })(token);
        /*@20:9*/
        if (type !== 'newline') {
            continue;
        };
        if (value === 'indent') {
            /*@22:31*/
            depth++;
        } else if (value === 'dedent') {
            depth--;
        };
        /*@25:9*/
        if (k === i) {
            tokens[k] = null;
        } else if (depth === 0) {
            tokens[k] = ['newline', 'nodent'];
            /*@29:13*/
            return;
        };
    };
};
rules = {
    operator: regexmap(['*', '/', '^', '%', '-', '+', '@', '=', '--', '++', '+=', '*=', '%=', '-=', '/=', '=>', '??', '?', '||', '&&', '!', '<', '>', '<=', '>=', '==', '!=', 'in', 'not in', 'instanceof', 'typeof', 'new', 'equals', 'not equals', '.', '?.']).concat([/^\s+:\s+/]),
    delimiter: regexmap([';', ',', ':', '...']),
    leftdelimiter: regexmap(['(', '?(', '[', '?[', '{']),
    rightdelimiter: regexmap([')', ']', '}']),
    newline: [/^\n[^\S\n]*/],
    bool: regexmap(['true', 'false']),
    keyword: regexmap(['_', 'pass', 'equals', 'null', 'undefined', 'not', 'true', 'false', 'arguments', 'export', 'import', 'void', 'debugger', 'with', 'delete', 'var', 'let', 'const', 'typeof', 'new', 'class', 'extends', 'this', 'self', 'super', 'return', 'yield', 'function', 'if', 'else', 'else if', 'switch', 'case', 'default', 'do', 'while', 'break', 'continue', 'for', 'in', 'of', 'instanceof', 'try', 'catch', 'finally', 'throw', 'enum', 'implements', 'static', 'public', 'package', 'interface', 'protected', 'private', 'abstract', 'final', 'native', 'boolean', 'float', 'short', 'byte', 'goto', 'synchronized', 'char', 'int', 'transient', 'double', 'long', 'volatile']),
    identifier: [/^[a-zA-Z_$][0-9a-zA-Z_$]*/],
    number: [/^[0-9]+/, /^[0-9]*\.[0-9]+/, /^0x[0-9a-fA-F]+/],
    string: [/^"("|.*?[^\\]"|.*?\\\\")/, /^'('|.*?[^\\]'|.*?\\\\')/],
    regex: [/^\/[^\/*](.*?[^\\]\/|.*?\\\\\/)[gim]*/],
    comment: [/^\/\/.*/, /^\/\*[^]*?\*\//],
    ignore: [/^[^\S\n]+/, /^#[A-Z]+/]
};
/*@113:1*/
exports.tokenize = function(input) {
    var residue, offset, tokens, output, indents, indentLength, lastDepth, useTabs, i6, l5, type, value, i, start2, end2, step2, i7, l6, token;
    (function(ref2) {
        residue = ref2[0];
        offset = ref2[1];
        return ref2;
    })([input, 0]);
    /*@115:5*/
    tokens = [];

    // Tokenizer
    while (residue.length > 0) {
        var lastType, type, value, i3, l2, list, t;
        lastType = null;
        /*@120:9*/
        (function(ref3) {
            type = ref3[0];
            value = ref3[1];
            return ref3;
        })([null, '']);
        /*@121:9*/
        if (tokens.length > 0) {
            (function(ref4) {
                (function(ref5) {
                    lastType = ref5[0];
                    return ref5;
                })(ref4[ref4.length - 1]);
                return ref4;
            })(tokens);
        };
        /*@123:9*/
        l2 = rules;
        for (i3 in l2) {
            list = l2[i3];
            t = parseInt(i3, 10);
            if (isNaN(t)) t = i3;
            var i4, l3, regex;
            /*@125:13*/
            // Check whether regex or division
            if ((t === 'regex') && (!inOp(lastType, ['keyword', 'operator', 'leftdelimiter', 'delimiter', 'newline', null]))) {
                continue;
            };
            l3 = enumerate(list);
            for (i4 = 0; i4 < l3.length; i4++) {
                regex = l3[i4];
                var matches;
                /*@130:17*/
                matches = regex.exec(residue);
                if ((matches == null) || (matches[0].length <= value.length)) {
                    continue;
                };
                /*@134:17*/
                (function(ref6) {
                    type = ref6[0];
                    value = ref6[1];
                    return ref6;
                })([t, matches[0]]);
            };
        };
        /*@137:9*/
        // No token found
        if (type == null) {
            throw {
                message: ("Syntax error: Unexpected '" + residue[0]) + "'",
                offset: offset
            };
        };
        /*@143:9*/
        // Don't add newline twice
        if (((type === 'newline') && (tokens.length > 0)) && (tokens[tokens.length - 1][0] === 'newline')) {
            tokens.pop();
        };
        if (type !== 'ignore') {
            var token;
            /*@147:13*/
            token = [type, value.trim()];
            if (token[1] === '') {
                token[1] = value;
            };
            /*@149:13*/
            token.offset = offset;
            tokens.push(token);
        };
        offset += value.length;
        /*@153:9*/
        residue = residue.slice(value.length);
    };
    output = [];

    // Detect indents & dedents
    indents = (function() {
        var r1, i5, l4, t, x;
        r1 = [];
        l4 = enumerate(tokens);
        for (i5 = 0; i5 < l4.length; i5++) {
            (function(ref7) {
                t = ref7[0];
                x = ref7[1];
                return ref7;
            })(l4[i5]);
            if (!(t === 'newline')) continue;
            r1.push(x.length - 1);
        };
        return r1;
    })();
    /*@159:5*/
    indentLength = gcd.apply(this, indents.filter(function(x) {
        return x !== 0;
    }));
    (function(ref8) {
        lastDepth = ref8[0];
        useTabs = ref8[1];
        return ref8;
    })([0, null]);
    /*@162:5*/
    l5 = tokens;
    for (i6 in l5) {
        (function(ref9) {
            type = ref9[0];
            value = ref9[1];
            return ref9;
        })(l5[i6]);
        i = parseInt(i6, 10);
        if (isNaN(i)) i = i6;
        var depth;
        /*@163:9*/
        if (type !== 'newline') {
            output.push(tokens[i]);
            continue;
        };
        /*@167:9*/
        depth = (value.length - 1) / indentLength;
        if (depth !== 0) {

            // Check for mixed indentation
            if (useTabs == null) {
                /*@172:17*/
                useTabs = inOp('\t', value);
            } else if (useTabs !== (inOp('\t', value))) {
                throw {
                    message: 'Mixed indentation',
                    offset: tokens[i].offset
                };
            };
        };
        /*@179:9*/
        if (depth > lastDepth) {
            var start, end, step, x1;
            start = 1;
            end = depth - lastDepth;
            step = (end === start) ? 1 : Math.sign(end - start);
            for (x1 = start; step > 0 ? x1 <= end : x1 >= end; x1 += step) {
                var token;
                /*@181:17*/
                token = ['newline', 'indent'];
                token.offset = tokens[i].offset;
                output.push(token);
            };
        } else if (depth < lastDepth) {
            var start1, end1, step1, x2;
            /*@185:13*/
            start1 = 1;
            end1 = lastDepth - depth;
            step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
            for (x2 = start1; step1 > 0 ? x2 <= end1 : x2 >= end1; x2 += step1) {
                var token;
                /*@186:17*/
                token = ['newline', 'dedent'];
                token.offset = tokens[i].offset;
                output.push(token);
            };
        } else {
            /*@190:13*/
            output.push(['newline', 'nodent']);
        };
        lastDepth = depth;
    };
    /*@194:5*/
    start2 = 1;
    end2 = lastDepth;
    step2 = 2 - start2;
    for (i = start2; step2 > 0 ? i <= end2 : i >= end2; i += step2) {
        output.push(['newline', 'dedent']);
    };
    /*@198:5*/
    // Remove superfluous newlines
    l6 = output;
    for (i7 in l6) {
        token = l6[i7];
        i = parseInt(i7, 10);
        if (isNaN(i)) i = i7;
        if (!((function() {
        if (((typeof token) === 'undefined') || (token == null)) {
            return null;
        };
        return token[0];
    })() === 'operator')) continue;
        /*@199:9*/
        if (inOp(token[1], ['++', '--', 'typeof', 'new'])) {
            continue;
        };
        if (((function() {
            var r2;
            r2 = output[i - 1];
            if (((typeof r2) === 'undefined') || (r2 == null)) {
                return null;
            };
            return r2[0];
        })() === 'newline') && ((function() {
            var r3;
            r3 = output[i - 1];
            if (((typeof r3) === 'undefined') || (r3 == null)) {
                return null;
            };
            return r3[1];
        })() !== 'dedent')) {
            /*@203:13*/
            removeNewline(output, i - 1);
        };
        if (((function() {
            var r4;
            r4 = output[i + 1];
            if (((typeof r4) === 'undefined') || (r4 == null)) {
                return null;
            };
            return r4[0];
        })() === 'newline') && ((function() {
            var r5;
            r5 = output[i + 1];
            if (((typeof r5) === 'undefined') || (r5 == null)) {
                return null;
            };
            return r5[1];
        })() !== 'dedent')) {
            /*@205:13*/
            removeNewline(output, i + 1);
        };
    };
    return output.filter(function(x) {
        return x != null;
    });
};
})();
