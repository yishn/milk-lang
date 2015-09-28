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
    return gcdInner(gcd.apply(this, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(args.slice(0, middle + 1));
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        return r1;
    })()), gcd.apply(this, (function() {
        var r2, i3, l2, x2;
        r2 = [];
        l2 = enumerate(args.slice(middle + 1));
        for (i3 = 0; i3 < l2.length; i3++) {
            x2 = l2[i3];
            r2.push(x2);
        };
        return r2;
    })()));
};
/*@12:1*/
removeNewline = function(tokens, i) {
    var depth, i4, l3, token, k;
    if (equals(tokens[i], ['newline', 'nodent'])) {
        tokens[i] = null;
        /*@15:9*/
        return;
    };
    depth = 0;
    l3 = tokens;
    for (i4 in l3) {
        token = l3[i4];
        k = parseInt(i4, 10);
        if (isNaN(k)) k = i4;
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
    var residue, offset, tokens, output, indents, indentLength, lastDepth, useTabs, i9, l8, type, value, i, start2, end2, step2, i10, l9, token;
    (function(ref2) {
        residue = ref2[0];
        offset = ref2[1];
        return ref2;
    })([input, 0]);
    /*@115:5*/
    tokens = [];

    // Tokenizer
    while (residue.length > 0) {
        var lastType, type, value, i5, l4, list, t;
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
        l4 = rules;
        for (i5 in l4) {
            list = l4[i5];
            t = parseInt(i5, 10);
            if (isNaN(t)) t = i5;
            var i6, l5, regex;
            /*@125:13*/
            // Check whether regex or division
            if ((t === 'regex') && (!inOp(lastType, ['keyword', 'operator', 'leftdelimiter', 'delimiter', 'newline', null]))) {
                continue;
            };
            l5 = enumerate(list);
            for (i6 = 0; i6 < l5.length; i6++) {
                regex = l5[i6];
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
        var r3, i7, l6, t, x;
        r3 = [];
        l6 = enumerate(tokens);
        for (i7 = 0; i7 < l6.length; i7++) {
            (function(ref7) {
                t = ref7[0];
                x = ref7[1];
                return ref7;
            })(l6[i7]);
            if (!(t === 'newline')) continue;
            r3.push(x.length - 1);
        };
        return r3;
    })();
    /*@159:5*/
    indentLength = gcd.apply(this, (function() {
        var r4, i8, l7, x3;
        r4 = [];
        l7 = enumerate(indents.filter(function(x) {
            return x !== 0;
        }));
        for (i8 = 0; i8 < l7.length; i8++) {
            x3 = l7[i8];
            r4.push(x3);
        };
        return r4;
    })());
    /*@160:5*/
    (function(ref8) {
        lastDepth = ref8[0];
        useTabs = ref8[1];
        return ref8;
    })([0, null]);
    /*@162:5*/
    l8 = tokens;
    for (i9 in l8) {
        (function(ref9) {
            type = ref9[0];
            value = ref9[1];
            return ref9;
        })(l8[i9]);
        i = parseInt(i9, 10);
        if (isNaN(i)) i = i9;
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
            var start, end, step, x4;
            start = 1;
            end = depth - lastDepth;
            step = (end === start) ? 1 : Math.sign(end - start);
            for (x4 = start; step > 0 ? x4 <= end : x4 >= end; x4 += step) {
                var token;
                /*@181:17*/
                token = ['newline', 'indent'];
                token.offset = tokens[i].offset;
                output.push(token);
            };
        } else if (depth < lastDepth) {
            var start1, end1, step1, x5;
            /*@185:13*/
            start1 = 1;
            end1 = lastDepth - depth;
            step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
            for (x5 = start1; step1 > 0 ? x5 <= end1 : x5 >= end1; x5 += step1) {
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
    l9 = output;
    for (i10 in l9) {
        token = l9[i10];
        i = parseInt(i10, 10);
        if (isNaN(i)) i = i10;
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
            var r5;
            r5 = output[i - 1];
            if (((typeof r5) === 'undefined') || (r5 == null)) {
                return null;
            };
            return r5[0];
        })() === 'newline') && ((function() {
            var r6;
            r6 = output[i - 1];
            if (((typeof r6) === 'undefined') || (r6 == null)) {
                return null;
            };
            return r6[1];
        })() !== 'dedent')) {
            /*@203:13*/
            removeNewline(output, i - 1);
        };
        if (((function() {
            var r7;
            r7 = output[i + 1];
            if (((typeof r7) === 'undefined') || (r7 == null)) {
                return null;
            };
            return r7[0];
        })() === 'newline') && ((function() {
            var r8;
            r8 = output[i + 1];
            if (((typeof r8) === 'undefined') || (r8 == null)) {
                return null;
            };
            return r8[1];
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