(function() {
var typemap, operatormap, leftdelimitermap, keywordmap, assignmentOp, comparisonOp, elementOp, additionOp, multOp, prepostOp, unaryOp, dotOp, bracketDel, statementKeywords, unaryKeywords, nullKeywords, searchTokenR, searchTokenL, searchTokens, searchMatchingDelimiter, parseExpression, parseLambdaHead, parsePattern, parseArrayPattern, parseObjectPattern, parseObjectPatternItem, parseFunction, parseArray, parseObject, parseKeyValuePair, parseBlock, parseStatements, parseStatement, parseUnaryKeyword, parseClass, parseTry, parseIf, parseForHead, parseFor, parseWhile;
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
typemap = function(type, l) {
    return l.map(function(x) {
        return [type, x];
    });
};
/*@2:1*/
operatormap = function(x1) {
    return typemap('operator', x1);
};
leftdelimitermap = function(x2) {
    return typemap('leftdelimiter', x2);
};
/*@4:1*/
keywordmap = function(x3) {
    return typemap('keyword', x3);
};
assignmentOp = operatormap(['=', '+=', '-=', '*=', '^=', '/=', '%=']);
/*@10:1*/
comparisonOp = operatormap(['<=', '>=', '<', '>', '==', '!=', 'equals', 'not equals']);
elementOp = operatormap(['in', 'instanceof', 'not in']);
additionOp = operatormap(['+', '-']);
/*@18:1*/
multOp = operatormap(['*', '/', '%']);
prepostOp = operatormap(['++', '--']);
unaryOp = operatormap(['typeof', '!']);
/*@21:1*/
dotOp = operatormap(['.', '?.', '()', '?()', '[]', '?[]']);
bracketDel = leftdelimitermap(['[', '?[']);
statementKeywords = keywordmap(['class', 'for', 'while', 'if', 'else', 'else if', 'try', 'catch', 'return', 'throw', 'delete', 'continue', 'pass', 'break']);
/*@29:1*/
unaryKeywords = keywordmap(['delete', 'throw', 'return']);
nullKeywords = keywordmap(['continue', 'pass', 'break']);

// Expression
searchTokenR = function() {
    var needles, hay, i2, l1, token, i;
    (function(ref) {
        needles = (0 >= (ref.length - 1)) ? [] : [].slice.call(ref, 0, -1);
        hay = ref[ref.length - 1];
        return ref;
    })(arguments);
    /*@35:5*/
    l1 = hay;
    for (i2 in l1) {
        token = l1[i2];
        i = parseInt(i2, 10);
        if (isNaN(i)) i = i2;
        /*@36:9*/
        if (needles.some(function(x) {
            return equals(token.slice(0, (x.length - 1) + 1), x);
        })) {
            return i;
        };
    };
    /*@39:5*/
    return -1;
};
searchTokenL = function() {
    var needles, hay, start1, end1, step, i;
    (function(ref1) {
        needles = (0 >= (ref1.length - 1)) ? [] : [].slice.call(ref1, 0, -1);
        hay = ref1[ref1.length - 1];
        return ref1;
    })(arguments);
    /*@42:5*/
    if (hay.length === 0) {
        return -1;
    };
    start1 = hay.length - 1;
    end1 = 0;
    step = (end1 === start1) ? 1 : Math.sign(end1 - start1);
    for (i = start1; step > 0 ? i <= end1 : i >= end1; i += step) {
        /*@45:9*/
        if (needles.some(function(x) {
            return equals(hay[i].slice(0, (x.length - 1) + 1), x);
        })) {
            return i;
        };
    };
    /*@48:5*/
    return -1;
};
searchTokens = function() {
    var needles, hay, r, i5, l2, token, i;
    (function(ref2) {
        needles = (0 >= (ref2.length - 1)) ? [] : [].slice.call(ref2, 0, -1);
        hay = ref2[ref2.length - 1];
        return ref2;
    })(arguments);
    /*@51:5*/
    r = [];
    l2 = hay;
    for (i5 in l2) {
        token = l2[i5];
        i = parseInt(i5, 10);
        if (isNaN(i)) i = i5;
        /*@54:9*/
        if (needles.some(function(x) {
            return equals(token, x);
        })) {
            r.push(i);
        };
    };
    /*@57:5*/
    return r;
};
searchMatchingDelimiter = function(tokens, index) {
    var delimiter, matchingdel, depth, i6, l3, type, value, i;
    /*@60:5*/
    if (tokens[index][0] !== 'leftdelimiter') {
        return index;
    };
    delimiter = tokens[index][1][tokens[index][1].length - 1];
    /*@63:5*/
    matchingdel = {
        '(': ')',
        '[': ']',
        '{': '}'
    };
    /*@64:5*/
    depth = 0;
    l3 = tokens;
    for (i6 in l3) {
        (function(ref3) {
            type = ref3[0];
            value = ref3[1];
            return ref3;
        })(l3[i6]);
        i = parseInt(i6, 10);
        if (isNaN(i)) i = i6;
        if (!((i >= index) && (inOp(type, ['leftdelimiter', 'rightdelimiter'])))) continue;
        /*@67:9*/
        if (inOp(value, [delimiter, '?' + delimiter])) {
            depth++;
        } else if (value === matchingdel[delimiter]) {
            depth--;
        };
        /*@71:9*/
        if (depth === 0) {
            return i;
        };
    };
    /*@74:5*/
    return -1;
};
parseExpression = function() {
    var tokens, breakerTokens, output, placeholders, start2, end2, step1, i, j, k, kk;
    (function(ref4) {
        tokens = ref4[0];
        breakerTokens = (1 >= ref4.length) ? [] : [].slice.call(ref4, 1);
        return ref4;
    })(arguments);
    /*@77:5*/
    output = [];
    placeholders = [];

    // Detect delimiters
    start2 = 0;
    end2 = tokens.length - 1;
    step1 = 1 - start2;
    for (i = start2; step1 > 0 ? i <= end2 : i >= end2; i += step1) {
        var token;
        /*@82:9*/
        token = tokens[i];
        if (((((token[0] === 'delimiter') || (token[0] === 'rightdelimiter')) || (token[0] === 'newline')) || statementKeywords.some(function(x) {
            return equals(x, token);
        })) || breakerTokens.some(function(x) {
            return equals(x, token);
        })) {
            /*@90:13*/
            // Detect end of expression
            break;
        } else if (token[0] === 'leftdelimiter') {
            var j;

            // Make placeholder
            j = searchMatchingDelimiter(tokens, i);
            /*@95:13*/
            placeholders.push(tokens.slice(i, j + 1));
            output.push(['placeholder', placeholders.length - 1]);
            i = j;
            /*@98:13*/
            continue;
        } else if (equals(token, ['keyword', 'function'])) {
            var tree, len;

            // Function closure
            (function(ref5) {
                tree = ref5[0];
                len = ref5[1];
                return ref5;
            })(parseFunction(tokens.slice(i)));
            /*@103:13*/
            return [tree, i + len];
        } else if (assignmentOp.some(function(x) {
            return equals(x, token);
        })) {
            var pattern, tree, len;
            /*@107:13*/
            // Drop everything!
            (function(ref6) {
                pattern = ref6[0];
                return ref6;
            })(parsePattern(tokens.slice(0, (i - 1) + 1)));
            (function(ref7) {
                tree = ref7[0];
                len = ref7[1];
                return ref7;
            })(parseExpression(tokens.slice(i + 1)));
            /*@110:13*/
            return [[token[1], pattern, tree], (i + 1) + len];
        };
        output.push(token);
    };
    /*@114:5*/
    if (output.length === 0) {
        throw {
            message: 'Expecting an expression here',
            offset: tokens[0].offset
        };
    };
    /*@121:5*/
    // Replace placeholders
    j = -1;
    while ((++j) < output.length) {
        var id, t, token;
        if (output[j][0] !== 'placeholder') {
            /*@123:43*/
            continue;
        };
        id = output[j][1];
        t = placeholders[id];
        /*@127:9*/
        token = t[0];
        if ((equals(token, ['leftdelimiter', '('])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;

            // Lambda head
            (function(ref8) {
                tree = ref8[0];
                return ref8;
            })(parseLambdaHead(t));
            /*@133:13*/
            output[j] = tree;
        } else if ((equals(token, ['leftdelimiter', '('])) && (inOp((function() {
            var r1;
            r1 = output[j - 1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[0];
        })(), [null, 'operator', 'newline']))) {
            var tree;
            /*@138:13*/
            // Expression grouping
            (function(ref9) {
                tree = ref9[0];
                return ref9;
            })(parseExpression(t.slice(1)));
            output[j] = tree;
        } else if ((equals(token, ['leftdelimiter', '('])) || (equals(token, ['leftdelimiter', '?(']))) {
            var tree;
            /*@144:13*/
            // Function call
            (function(ref10) {
                tree = ref10[0];
                return ref10;
            })(parseArray(t.slice(1)));
            output.splice(j, 1, ['operator', token[1] + ')'], tree);
            /*@146:13*/
            j++;
        } else if ((equals(token, ['leftdelimiter', '['])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;

            // Lambda head
            (function(ref11) {
                tree = ref11[0];
                return ref11;
            })(parseArrayPattern(t.slice(1)));
            /*@152:13*/
            output[j] = ['arraypattern', tree];
        } else if ((equals(token, ['leftdelimiter', '['])) || (equals(token, ['leftdelimiter', '?[']))) {
            var indexer, tree;

            // Indexer or array
            indexer = !inOp((function() {
                var r2;
                r2 = output[j - 1];
                if (((typeof r2) === 'undefined') || (r2 == null)) {
                    return null;
                };
                return r2[0];
            })(), [null, 'operator', 'newline']);
            /*@158:13*/
            (function(ref12) {
                tree = ref12[0];
                return ref12;
            })(parseArray(t.slice(1)));
            output[j] = tree;
            /*@161:13*/
            if (indexer) {
                output.splice(j, 0, ['operator', token[1] + ']']);
                j++;
            };
        } else if ((equals(token, ['leftdelimiter', '{'])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;
            /*@168:13*/
            // Lambda head
            (function(ref13) {
                tree = ref13[0];
                return ref13;
            })(parseObjectPattern(t.slice(1)));
            output[j] = ['arraypattern', tree];
        } else if (equals(token, ['leftdelimiter', '{'])) {
            var tree;
            /*@173:13*/
            // Object
            (function(ref14) {
                tree = ref14[0];
                return ref14;
            })(parseObject(t.slice(1)));
            output[j] = tree;
        };
    };
    /*@177:5*/
    // Operator precedence
    if ((k = searchTokenR(['operator', '=>'], output)) !== (-1)) {
        var head, body;
        head = output[k - 1];
        if (head[0] === 'identifier') {
            /*@181:13*/
            head = ['arraypattern', [head, null]];
        } else if (head[0] !== 'arraypattern') {
            throw {
                message: 'Invalid lambda arguments',
                offset: output[k].offset
            };
        };
        /*@189:9*/
        (function(ref15) {
            body = ref15[0];
            return ref15;
        })(parseExpression(output.slice(k + 1)));
        output = ['lambda', null, head, body];
    } else if ((k = searchTokenR(['operator', '?'], output)) !== (-1)) {
        var m, condition, left, right;
        /*@194:9*/
        m = searchTokenR(['operator', ':'], output.slice(k));
        if (m < 0) {
            throw {
                message: "Didn't find the ':' to the '?'",
                offset: output[k].offset
            };
        };
        /*@199:9*/
        m += k;
        (function(ref16) {
            condition = ref16[0];
            return ref16;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@202:9*/
        (function(ref17) {
            left = ref17[0];
            return ref17;
        })(parseExpression(output.slice(k + 1, (m - 1) + 1)));
        (function(ref18) {
            right = ref18[0];
            return ref18;
        })(parseExpression(output.slice(m + 1)));
        /*@205:9*/
        output = ['?', condition, left, right];
    } else if ((((k = searchTokenR(['operator', '??'], output)) !== (-1)) || ((k = searchTokenL(['operator', '||'], output)) !== (-1))) || ((k = searchTokenL(['operator', '&&'], output)) !== (-1))) {
        var left, right;
        (function(ref19) {
            left = ref19[0];
            return ref19;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@211:9*/
        (function(ref20) {
            right = ref20[0];
            return ref20;
        })(parseExpression(output.slice(k + 1)));
        output = [output[k][1], left, right];
    } else if ((kk = searchTokens.apply(null, (function() {
        var r3, i8, l4, x4;
        r3 = [];
        l4 = enumerate(comparisonOp);
        for (i8 = 0; i8 < l4.length; i8++) {
            x4 = l4[i8];
            r3.push(x4);
        };
        r3.push(output);
        return r3;
    })())).length > 0) {
        var r, i9, l5, y, m, expr;
        /*@216:9*/
        r = (kk.length > 1) ? ['chaincmp'] : [];
        l5 = kk;
        for (i9 in l5) {
            y = l5[i9];
            m = parseInt(i9, 10);
            if (isNaN(m)) m = i9;
            var start, expr;
            /*@219:13*/
            start = (m >= 1) ? (kk[m - 1] + 1) : 0;
            (function(ref21) {
                expr = ref21[0];
                return ref21;
            })(parseExpression(output.slice(start, (kk[m] - 1) + 1)));
            /*@221:13*/
            r.push(expr);
            r.push(output[kk[m]][1]);
        };
        (function(ref22) {
            expr = ref22[0];
            return ref22;
        })(parseExpression(output.slice(kk[m] + 1)));
        /*@225:9*/
        r.push(expr);
        if (kk.length === 1) {
            output = [r[1], r[0], r[2]];
        } else {
            /*@230:13*/
            output = r;
        };
    } else if (((k = searchTokenL.apply(null, (function() {
        var r4, i10, l6, x5;
        r4 = [];
        l6 = enumerate(elementOp);
        for (i10 = 0; i10 < l6.length; i10++) {
            x5 = l6[i10];
            r4.push(x5);
        };
        r4.push(output);
        return r4;
    })())) !== (-1)) || ((k = searchTokenR(['operator', '@'], output)) !== (-1))) {
        var left, right;
        /*@234:9*/
        (function(ref23) {
            left = ref23[0];
            return ref23;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(ref24) {
            right = ref24[0];
            return ref24;
        })(parseExpression(output.slice(k + 1)));
        /*@237:9*/
        output = [output[k][1], left, right];
    } else if ((k = searchTokenL.apply(null, (function() {
        var r5, i11, l7, x6;
        r5 = [];
        l7 = enumerate(additionOp);
        for (i11 = 0; i11 < l7.length; i11++) {
            x6 = l7[i11];
            r5.push(x6);
        };
        r5.push(output);
        return r5;
    })())) !== (-1)) {
        var unary, left, right, len;
        /*@240:9*/
        unary = inOp((function() {
            var r6;
            r6 = output[k - 1];
            if (((typeof r6) === 'undefined') || (r6 == null)) {
                return null;
            };
            return r6[0];
        })(), [null, 'operator', 'leftdelimiter', 'delimiter']);
        /*@241:9*/
        left = null;
        if (!unary) {
            (function(ref25) {
                left = ref25[0];
                return ref25;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
        };
        /*@244:9*/
        (function(ref26) {
            right = ref26[0];
            len = ref26[1];
            return ref26;
        })(parseExpression(output.slice(k + 1)));
        /*@246:9*/
        if (unary) {
            (function() {
                var r7, start3, len1;
                r7 = output;
                start3 = k;
                len1 = ((k + len) + 1) - start3;
                [].splice.apply(r7, [start3, len1].concat([[output[k][1], right]]));
                return r7;
            })();
            /*@248:13*/
            (function(ref27) {
                output = ref27[0];
                return ref27;
            })(parseExpression(output));
        } else {
            /*@250:13*/
            output = [output[k][1], left, right];
        };
    } else if ((k = searchTokenL.apply(null, (function() {
        var r8, i12, l8, x7;
        r8 = [];
        l8 = enumerate(multOp);
        for (i12 = 0; i12 < l8.length; i12++) {
            x7 = l8[i12];
            r8.push(x7);
        };
        r8.push(output);
        return r8;
    })())) !== (-1)) {
        var left, right;
        /*@253:9*/
        (function(ref28) {
            left = ref28[0];
            return ref28;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(ref29) {
            right = ref29[0];
            return ref29;
        })(parseExpression(output.slice(k + 1)));
        /*@256:9*/
        output = [output[k][1], left, right];
    } else if ((k = searchTokenL.apply(null, (function() {
        var r9, i13, l9, x8;
        r9 = [];
        l9 = enumerate(prepostOp);
        for (i13 = 0; i13 < l9.length; i13++) {
            x8 = l9[i13];
            r9.push(x8);
        };
        r9.push(output);
        return r9;
    })())) !== (-1)) {
        var prevType, nextType, l, prefix, postfix;
        /*@259:9*/
        prevType = (function() {
            var r10;
            r10 = output[k - 1];
            if (((typeof r10) === 'undefined') || (r10 == null)) {
                return null;
            };
            return r10[0];
        })();
        /*@260:9*/
        nextType = (function() {
            var r11;
            r11 = output[k + 1];
            if (((typeof r11) === 'undefined') || (r11 == null)) {
                return null;
            };
            return r11[0];
        })();
        /*@262:9*/
        l = [null, 'newline', 'operator'];
        prefix = (inOp(prevType, l)) && (!inOp(nextType, l));
        postfix = (inOp(nextType, l)) && (!inOp(prevType, l));
        /*@266:9*/
        if (prefix === postfix) {
            throw {
                message: ("Ambiguous operator '" + output[k][1]) + "'",
                offset: output[k].offset
            };
        };
        /*@271:9*/
        if (prefix) {
            var subject;
            (function(ref30) {
                subject = ref30[0];
                return ref30;
            })(parseExpression(output.slice(k + 1)));
            /*@273:13*/
            output = [output[k][1] + '_', subject];
        } else {
            var subject;
            (function(ref31) {
                subject = ref31[0];
                return ref31;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
            /*@276:13*/
            output = ['_' + output[k][1], subject];
        };
    } else if ((k = searchTokenL.apply(null, (function() {
        var r12, i14, l10, x9;
        r12 = [];
        l10 = enumerate(unaryOp);
        for (i14 = 0; i14 < l10.length; i14++) {
            x9 = l10[i14];
            r12.push(x9);
        };
        r12.push(output);
        return r12;
    })())) !== (-1)) {
        var subject, len;
        /*@279:9*/
        (function(ref32) {
            subject = ref32[0];
            len = ref32[1];
            return ref32;
        })(parseExpression(output.slice(k + 1)));
        /*@281:9*/
        (function() {
            var r13, start4, len2;
            r13 = output;
            start4 = k;
            len2 = ((k + len) + 1) - start4;
            [].splice.apply(r13, [start4, len2].concat([[output[k][1], subject]]));
            return r13;
        })();
        /*@282:9*/
        (function(ref33) {
            output = ref33[0];
            return ref33;
        })(parseExpression(output));
    } else if ((k = searchTokenR(['operator', '^'], output)) !== (-1)) {
        var left, right;
        /*@285:9*/
        (function(ref34) {
            left = ref34[0];
            return ref34;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(ref35) {
            right = ref35[0];
            return ref35;
        })(parseExpression(output.slice(k + 1)));
        /*@288:9*/
        output = ['^', left, right];
    } else if ((k = searchTokenR(['operator', 'new'], output)) !== (-1)) {
        var subject, len;
        (function(ref36) {
            subject = ref36[0];
            len = ref36[1];
            return ref36;
        })(parseExpression(output.slice(k + 1)));
        /*@292:9*/
        (function() {
            var r14, start5, len3;
            r14 = output;
            start5 = k;
            len3 = ((k + len) + 1) - start5;
            [].splice.apply(r14, [start5, len3].concat([['new', subject]]));
            return r14;
        })();
        /*@293:9*/
        (function(ref37) {
            output = ref37[0];
            return ref37;
        })(parseExpression(output));
    } else if ((k = searchTokenL.apply(null, (function() {
        var r15, i15, l11, x10;
        r15 = [];
        l11 = enumerate(dotOp);
        for (i15 = 0; i15 < l11.length; i15++) {
            x10 = l11[i15];
            r15.push(x10);
        };
        r15.push(output);
        return r15;
    })())) !== (-1)) {
        var left, right;
        /*@296:9*/
        (function(ref38) {
            left = ref38[0];
            return ref38;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(ref39) {
            right = ref39[0];
            return ref39;
        })(parseExpression(output.slice(k + 1)));
        /*@299:9*/
        output = [output[k][1], left, right];
    } else {
        if (output.length === 1) {
            output = output[0];
        } else {
            /*@303:15*/
            throw {
                message: "Expression not well-defined",
                offset: tokens[0].offset
            };
        };
    };
    /*@308:5*/
    return [output, i];
};
parseLambdaHead = function(tokens) {
    if (equals(tokens[0], ['leftdelimiter', '('])) {
        var pattern, len;
        /*@312:9*/
        (function(ref40) {
            pattern = ref40[0];
            len = ref40[1];
            return ref40;
        })(parseArrayPattern(tokens.slice(1)));
        /*@313:9*/
        return [pattern, len + 2];
    } else {
        var pattern, len;
        (function(ref41) {
            pattern = ref41[0];
            len = ref41[1];
            return ref41;
        })(parsePattern(tokens));
        /*@316:9*/
        return [['arraypattern', [pattern, null]], len];
    };
};

// Pattern matching
parsePattern = function() {
    var tokens, allowDefault, type, value, pointer, expr, len, output;
    (function(ref42) {
        tokens = ref42[0];
        allowDefault = (function() {
            var r16;
            r16 = ref42[1];
            if (((typeof r16) === 'undefined') || (r16 == null)) {
                return false;
            };
            return r16;
        })();
        return ref42;
    })(arguments);
    /*@321:5*/
    (function(ref43) {
        (function(ref44) {
            type = ref44[0];
            value = ref44[1];
            return ref44;
        })(ref43[0]);
        return ref43;
    })(tokens);
    /*@323:5*/
    if (type === 'leftdelimiter') {
        if (value === '[') {
            var pattern, len;
            (function(ref45) {
                pattern = ref45[0];
                len = ref45[1];
                return ref45;
            })(parseArrayPattern(tokens.slice(1)));
            /*@326:13*/
            return [pattern, len + 2];
        } else if (value === '{') {
            var pattern, len;
            (function(ref46) {
                pattern = ref46[0];
                len = ref46[1];
                return ref46;
            })(parseObjectPattern(tokens.slice(1)));
            /*@329:13*/
            return [pattern, len + 2];
        };
    };
    pointer = 0;
    /*@332:5*/
    (function(ref47) {
        expr = ref47[0];
        len = ref47[1];
        return ref47;
    })(parseExpression(tokens, ['operator', 'in'], ['operator', '=']));
    /*@333:5*/
    pointer += len;
    output = [expr, null];
    if ((!inOp(expr[0], ['[]', '?[]', '.', '?.', 'identifier'])) && (!equals(expr, ['keyword', '_']))) {
        /*@339:9*/
        throw {
            message: "Invalid pattern",
            offset: tokens[0].offset
        };
    };
    /*@344:5*/
    if (allowDefault && (equals(tokens[pointer], ['operator', '=']))) {
        pointer++;
        (function(ref48) {
            expr = ref48[0];
            len = ref48[1];
            return ref48;
        })(parseExpression(tokens.slice(pointer), ['operator', 'in']));
        /*@347:9*/
        pointer += len;
        output[1] = expr;
    };
    return [allowDefault ? output : output[0], pointer];
};
/*@352:1*/
parseArrayPattern = function(tokens) {
    var output, pointer;
    output = ['arraypattern'];
    pointer = 0;
    /*@356:5*/
    while (pointer < tokens.length) {
        var token;
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            /*@360:13*/
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            pointer++;
        } else if (equals(token, ['delimiter', '...'])) {
            /*@365:13*/
            output.push(['spread', ['keyword', '_']]);
            pointer++;
        } else if (equals(token, ['operator', '*'])) {
            var expr, len;
            /*@368:13*/
            (function(ref49) {
                expr = ref49[0];
                len = ref49[1];
                return ref49;
            })(parsePattern(tokens.slice(pointer + 1), true));
            /*@369:13*/
            output.push(['spread', expr]);
            pointer += (len + 1);
        } else {
            var expr, len;
            /*@372:13*/
            (function(ref50) {
                expr = ref50[0];
                len = ref50[1];
                return ref50;
            })(parsePattern(tokens.slice(pointer), true));
            /*@373:13*/
            output.push(expr);
            pointer += len;
        };
    };
    /*@376:5*/
    if (output.filter(function(x) {
        return x[0] === 'spread';
    }).length > 1) {
        throw {
            message: "Invalid multiple spreads in an array pattern",
            offset: tokens[0].offset
        };
    };
    /*@381:5*/
    return [output, pointer];
};
parseObjectPattern = function(tokens) {
    var output, pointer;
    /*@384:5*/
    output = ['objpattern'];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@388:9*/
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            /*@394:13*/
            pointer++;
        } else {
            var expr, end;
            (function(ref51) {
                expr = ref51[0];
                end = ref51[1];
                return ref51;
            })(parseObjectPatternItem(tokens.slice(pointer)));
            /*@397:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@400:5*/
    return [output, pointer];
};
parseObjectPatternItem = function(tokens) {
    var output, pointer, expr, end, defaultv;
    /*@403:5*/
    output = [];
    pointer = 0;
    (function(ref52) {
        expr = ref52[0];
        end = ref52[1];
        return ref52;
    })(parseExpression(tokens, ['operator', '=']));
    /*@407:5*/
    output.push(expr);
    pointer += end;
    defaultv = null;
    /*@411:5*/
    if (equals(tokens[pointer], ['operator', '='])) {
        pointer++;
        (function(ref53) {
            expr = ref53[0];
            end = ref53[1];
            return ref53;
        })(parseExpression(tokens.slice(pointer)));
        /*@414:9*/
        pointer += end;
        defaultv = expr;
        if (equals(tokens[pointer], ['delimiter', ':'])) {
            /*@418:13*/
            throw {
                message: "Object pattern keys don't have default values",
                offset: tokens[pointer].offset
            };
        };
    };
    /*@423:5*/
    if (equals(tokens[pointer], ['delimiter', ':'])) {
        var pattern;
        pointer++;
        (function(ref54) {
            pattern = ref54[0];
            end = ref54[1];
            return ref54;
        })(parsePattern(tokens.slice(pointer), true));
        /*@426:9*/
        pointer += end;
        output.push([pattern, null]);
    };
    if (equals(tokens[pointer], ['operator', '='])) {
        /*@430:9*/
        pointer++;
        (function(ref55) {
            expr = ref55[0];
            end = ref55[1];
            return ref55;
        })(parseExpression(tokens.slice(pointer)));
        /*@432:9*/
        pointer += end;
        output[1][1] = expr;
    };
    if (equals(tokens[pointer], ['delimiter', ':'])) {
        /*@436:9*/
        throw {
            message: "Unexpected ':'",
            offset: tokens[pointer].offset
        };
    };
    /*@441:5*/
    if (output.length === 1) {
        var node;
        node = output[0];
        if (node[0] !== 'identifier') {
            /*@444:37*/
            throw {
                message: "Identifier expected",
                offset: tokens[0].offset
            };
        };
        /*@449:9*/
        output = [output[0], [output[0], defaultv]];
    };
    return [output, pointer];
};
/*@455:1*/
// Objects
parseFunction = function(tokens) {
    var output, pointer, statements, end;
    output = ['function'];
    pointer = 1;
    /*@459:5*/
    if (tokens[pointer][0] === 'identifier') {
        output.push(tokens[pointer]);
        pointer++;
    } else {
        /*@463:9*/
        output.push(null);
    };
    if (equals(tokens[pointer], ['leftdelimiter', '('])) {
        var pattern, end;
        /*@466:9*/
        (function(ref56) {
            pattern = ref56[0];
            end = ref56[1];
            return ref56;
        })(parseArrayPattern(tokens.slice(pointer + 1)));
        /*@467:9*/
        output.push(pattern);
        pointer += (end + 2);
    } else {
        throw {
            message: "Expecting '('",
            offset: tokens[e].offset
        };
    };
    /*@474:5*/
    (function(ref57) {
        statements = ref57[0];
        end = ref57[1];
        return ref57;
    })(parseBlock(tokens.slice(pointer)));
    /*@475:5*/
    output.push(statements);
    pointer += end;
    return [output, pointer];
};
/*@480:1*/
parseArray = function(tokens) {
    var output, pointer;
    output = ['array'];
    pointer = 0;
    /*@484:5*/
    while (pointer < tokens.length) {
        var token;
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            /*@488:13*/
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            pointer++;
        } else if (equals(token, ['keyword', 'for'])) {
            var forhead, end;
            /*@493:13*/
            output[0] = 'arrayfor';
            (function(ref58) {
                forhead = ref58[0];
                end = ref58[1];
                return ref58;
            })(parseForHead(tokens.slice(pointer)));
            /*@496:13*/
            output.push(forhead);
            pointer += end;
        } else if (equals(token, ['delimiter', '...'])) {
            output.push(token);
            /*@500:13*/
            pointer++;
        } else if (equals(token, ['operator', '*'])) {
            var expr, end;
            pointer++;
            /*@503:13*/
            (function(ref59) {
                expr = ref59[0];
                end = ref59[1];
                return ref59;
            })(parseExpression(tokens.slice(pointer)));
            /*@504:13*/
            output.push(['spread', expr]);
            pointer += end;
        } else {
            var expr, end;
            /*@507:13*/
            (function(ref60) {
                expr = ref60[0];
                end = ref60[1];
                return ref60;
            })(parseExpression(tokens.slice(pointer)));
            /*@508:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@511:5*/
    if (output.some(function(x) {
        return equals(x, ['delimiter', '...']);
    })) {
        var start, end, next;
        start = output[1];
        /*@513:9*/
        end = (output[output.length - 1][0] === 'delimiter') ? null : output[output.length - 1];
        next = (output[2][0] === 'delimiter') ? null : output[2];
        return [['range', start, next, end], pointer];
    };
    /*@517:5*/
    if ((output[0] === 'arrayfor') && (output[2][0] !== 'for')) {
        throw {
            message: "Expecting 'for' directive",
            offset: tokens[0].offset
        };
    };
    /*@523:5*/
    return [output, pointer];
};
parseObject = function(tokens) {
    var output, pointer;
    /*@526:5*/
    output = ['object'];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@530:9*/
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            /*@536:13*/
            pointer++;
        } else if (equals(token, ['keyword', 'for'])) {
            var forhead, end;
            output[0] = 'objectfor';
            /*@540:13*/
            (function(ref61) {
                forhead = ref61[0];
                end = ref61[1];
                return ref61;
            })(parseForHead(tokens.slice(pointer)));
            /*@541:13*/
            output.push(forhead);
            pointer += end;
        } else {
            var expr, end;
            /*@544:13*/
            (function(ref62) {
                expr = ref62[0];
                end = ref62[1];
                return ref62;
            })(parseKeyValuePair(tokens.slice(pointer)));
            /*@545:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@548:5*/
    if ((output[0] === 'objectfor') && (output[2][0] !== 'for')) {
        throw {
            message: "Expecting 'for' directive",
            offset: tokens[0].offset
        };
    };
    /*@554:5*/
    return [output, pointer];
};
parseKeyValuePair = function(tokens) {
    var output, pointer;
    /*@557:5*/
    output = [];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@561:9*/
        token = tokens[pointer];
        if ((((token[0] === 'rightdelimiter') || (token[0] === 'newline')) || (equals(token, ['delimiter', ',']))) || (equals(token, ['keyword', 'for']))) {
            if (output.length > 2) {
                /*@567:35*/
                throw {
                    message: "Object literal has wrong syntax",
                    offset: token.offset
                };
            };
            /*@571:13*/
            break;
        } else if (equals(token, ['delimiter', ':'])) {
            pointer++;
        } else {
            var expr, end;
            /*@575:13*/
            (function(ref63) {
                expr = ref63[0];
                end = ref63[1];
                return ref63;
            })(parseExpression(tokens.slice(pointer)));
            /*@576:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@579:5*/
    if (output.length === 1) {
        var node;
        node = output[0];
        if (node[0] !== 'identifier') {
            /*@582:37*/
            throw {
                message: "Identifier expected",
                offset: tokens[0].offset
            };
        };
        /*@587:9*/
        output = [node, node];
    };
    return [output, pointer];
};
/*@593:1*/
// Statements
parseBlock = function(tokens) {
    var pointer;
    pointer = 0;
    if (!equals(tokens[pointer], ['delimiter', ':'])) {
        /*@597:9*/
        throw {
            message: "Expecting ':'",
            offset: tokens[pointer].offset
        };
    };
    /*@602:5*/
    pointer++;
    if (equals(tokens[pointer], ['newline', 'indent'])) {
        var s, len;
        (function(ref64) {
            s = ref64[0];
            len = ref64[1];
            return ref64;
        })(parseStatements(tokens.slice(pointer)));
        /*@606:9*/
        return [s, pointer + len];
    } else {
        var s, len;
        (function(ref65) {
            s = ref65[0];
            len = ref65[1];
            return ref65;
        })(parseStatement(tokens.slice(pointer)));
        /*@609:9*/
        return [['statements', s], pointer + len];
    };
};
parseStatements = function(tokens) {
    var output, depth, pointer, end;
    /*@612:5*/
    output = ['statements'];
    depth = 0;
    pointer = 0;
    /*@615:5*/
    end = tokens.length - 1;
    if (equals(tokens[0], ['newline', 'indent'])) {
        var start6, end3, step2, i;
        start6 = 1;
        end3 = tokens.length - 1;
        step2 = 2 - start6;
        for (i = start6; step2 > 0 ? i <= end3 : i >= end3; i += step2) {
            /*@619:13*/
            if (equals(tokens[i], ['newline', 'indent'])) {
                depth++;
            } else if (equals(tokens[i], ['newline', 'dedent'])) {
                depth--;
            };
            /*@624:13*/
            if (depth < 0) {
                end = i;
                break;
            };
        };
    };
    /*@628:5*/
    while (pointer <= end) {
        var s, len;
        if ((tokens[pointer][0] === 'newline') || (equals(tokens[pointer], ['delimiter', ';']))) {
            pointer++;
            /*@632:13*/
            continue;
        };
        (function(ref66) {
            s = ref66[0];
            len = ref66[1];
            return ref66;
        })(parseStatement(tokens.slice(pointer)));
        /*@635:9*/
        if (s.length !== 0) {
            output.push(s);
        };
        pointer += len;
    };
    /*@638:5*/
    return [output, end];
};
parseStatement = function(tokens) {
    var token, output;
    /*@641:5*/
    token = tokens[0];
    output = null;
    if (equals(token, ['keyword', 'for'])) {
        /*@645:9*/
        output = parseFor(tokens);
    } else if (equals(token, ['keyword', 'while'])) {
        output = parseWhile(tokens);
    } else if (equals(token, ['keyword', 'class'])) {
        /*@649:9*/
        output = parseClass(tokens);
    } else if (equals(token, ['keyword', 'if'])) {
        output = parseIf(tokens);
    } else if (equals(token, ['keyword', 'try'])) {
        /*@653:9*/
        output = parseTry(tokens);
    } else if (nullKeywords.some(function(x) {
        return equals(x, token);
    })) {
        output = [token, 1];
    } else if (unaryKeywords.some(function(x) {
        return equals(x, token);
    })) {
        /*@657:9*/
        output = parseUnaryKeyword(tokens);
    } else {
        output = parseExpression(tokens);
    };
    /*@661:5*/
    output[0].offset = tokens[0].offset;
    return output;
};
parseUnaryKeyword = function(tokens) {
    var token, expr, len;
    /*@665:5*/
    token = tokens[0];
    if (tokens[1][0] === 'newline') {
        token.push(null);
        /*@669:9*/
        return [token, 1];
    };
    (function(ref67) {
        expr = ref67[0];
        len = ref67[1];
        return ref67;
    })(parseExpression(tokens.slice(1)));
    /*@672:5*/
    token.push(expr);
    return [token, len + 1];
};
parseClass = function(tokens) {
    var pointer, output, s, len;
    /*@676:5*/
    pointer = 1;
    output = ['class'];
    if (tokens[pointer][0] === 'identifier') {
        /*@680:9*/
        output.push(tokens[pointer]);
        pointer++;
    } else {
        throw {
            message: "Expecting class identifier",
            offset: tokens[pointer].offset
        };
    };
    /*@688:5*/
    if (equals(tokens[pointer], ['keyword', 'extends'])) {
        var expr, len;
        pointer++;
        (function(ref68) {
            expr = ref68[0];
            len = ref68[1];
            return ref68;
        })(parseExpression(tokens.slice(pointer)));
        /*@691:9*/
        output.push(expr);
        pointer += len;
    } else {
        output.push(null);
    };
    /*@696:5*/
    (function(ref69) {
        s = ref69[0];
        len = ref69[1];
        return ref69;
    })(parseBlock(tokens.slice(pointer)));
    /*@697:5*/
    output.push(s);
    pointer += len;
    if (s.slice(1).some(function(x) {
        return x[0] !== 'function';
    })) {
        /*@701:9*/
        throw {
            message: "Class definitions can only hold functions",
            offset: tokens[0].offset
        };
    };
    /*@706:5*/
    return [output, pointer];
};

// Conditions
parseTry = function(tokens) {
    var pointer, output, block, len;
    /*@711:5*/
    pointer = 1;
    output = ['try'];
    (function(ref70) {
        block = ref70[0];
        len = ref70[1];
        return ref70;
    })(parseBlock(tokens.slice(pointer)));
    /*@715:5*/
    output.push(block);
    pointer += (len + 1);
    if (equals(tokens[pointer], ['keyword', 'catch'])) {
        var pattern;
        /*@719:9*/
        pointer++;
        pattern = null;
        if (!equals(tokens[pointer], ['delimiter', ':'])) {
            /*@723:13*/
            (function(ref71) {
                pattern = ref71[0];
                len = ref71[1];
                return ref71;
            })(parsePattern(tokens.slice(pointer)));
            /*@724:13*/
            pointer += len;
        };
        (function(ref72) {
            block = ref72[0];
            len = ref72[1];
            return ref72;
        })(parseBlock(tokens.slice(pointer)));
        /*@727:9*/
        pointer += (len + 1);
        output.push([pattern, block]);
    } else {
        output.push(null);
    };
    /*@732:5*/
    if (equals(tokens[pointer], ['keyword', 'finally'])) {
        pointer++;
        (function(ref73) {
            block = ref73[0];
            len = ref73[1];
            return ref73;
        })(parseBlock(tokens.slice(pointer)));
        /*@735:9*/
        pointer += (len + 1);
        output.push(block);
    } else {
        output.push(null);
    };
    /*@740:5*/
    return [output, pointer - 1];
};
parseIf = function(tokens) {
    var pointer, output, cond, len, block;
    /*@743:5*/
    pointer = 1;
    output = ['if'];
    (function(ref74) {
        cond = ref74[0];
        len = ref74[1];
        return ref74;
    })(parseExpression(tokens.slice(pointer)));
    /*@747:5*/
    pointer += len;
    (function(ref75) {
        block = ref75[0];
        len = ref75[1];
        return ref75;
    })(parseBlock(tokens.slice(pointer)));
    /*@749:5*/
    pointer += (len + 1);
    output.push([cond, block]);
    while (pointer < tokens.length) {
        var token;
        /*@753:9*/
        token = tokens[pointer];
        if (equals(token, ['keyword', 'else if'])) {
            pointer++;
            /*@757:13*/
            (function(ref76) {
                cond = ref76[0];
                len = ref76[1];
                return ref76;
            })(parseExpression(tokens.slice(pointer)));
            /*@758:13*/
            pointer += len;
            (function(ref77) {
                block = ref77[0];
                len = ref77[1];
                return ref77;
            })(parseBlock(tokens.slice(pointer)));
            /*@760:13*/
            pointer += (len + 1);
            output.push([cond, block]);
        } else {
            break;
        };
    };
    /*@766:5*/
    if (equals(tokens[pointer], ['keyword', 'else'])) {
        pointer++;
        (function(ref78) {
            block = ref78[0];
            len = ref78[1];
            return ref78;
        })(parseBlock(tokens.slice(pointer)));
        /*@769:9*/
        pointer += (len + 1);
        output.push(['else', block]);
    };
    return [output, pointer - 1];
};
/*@776:1*/
// Loops
parseForHead = function(tokens) {
    var pointer, first, second, listexpr, condition, len;
    pointer = 1;
    (function(ref79) {
        first = ref79[0];
        second = ref79[1];
        listexpr = ref79[2];
        condition = ref79[3];
        return ref79;
    })([null, null, null, null]);
    /*@780:5*/
    (function(ref80) {
        first = ref80[0];
        len = ref80[1];
        return ref80;
    })(parsePattern(tokens.slice(pointer)));
    /*@781:5*/
    pointer += len;
    if (equals(tokens[pointer], ['delimiter', ','])) {
        pointer++;
        /*@785:9*/
        (function(ref81) {
            second = ref81[0];
            len = ref81[1];
            return ref81;
        })(parsePattern(tokens.slice(pointer)));
        /*@786:9*/
        pointer += len;
    };
    if (equals(tokens[pointer], ['operator', 'in'])) {
        pointer++;
        /*@790:9*/
        (function(ref82) {
            listexpr = ref82[0];
            len = ref82[1];
            return ref82;
        })(parseExpression(tokens.slice(pointer)));
        /*@791:9*/
        pointer += len;
    } else {
        throw {
            message: "Expecting 'in'",
            offset: tokens[pointer].offset
        };
    };
    /*@797:5*/
    if (equals(tokens[pointer], ['keyword', 'if'])) {
        pointer++;
        (function(ref83) {
            condition = ref83[0];
            len = ref83[1];
            return ref83;
        })(parseExpression(tokens.slice(pointer)));
        /*@800:9*/
        pointer += len;
    };
    return [['for', [first, second], listexpr, condition], pointer];
};
/*@804:1*/
parseFor = function(tokens) {
    var forhead, pointer, s, len;
    (function(ref84) {
        forhead = ref84[0];
        pointer = ref84[1];
        return ref84;
    })(parseForHead(tokens));
    /*@806:5*/
    (function(ref85) {
        s = ref85[0];
        len = ref85[1];
        return ref85;
    })(parseBlock(tokens.slice(pointer)));
    /*@807:5*/
    forhead.push(s);
    return [forhead, pointer + len];
};
parseWhile = function(tokens) {
    var pointer, expr, len, s;
    /*@812:5*/
    pointer = 1;
    (function(ref86) {
        expr = ref86[0];
        len = ref86[1];
        return ref86;
    })(parseExpression(tokens.slice(pointer)));
    /*@814:5*/
    pointer += len;
    (function(ref87) {
        s = ref87[0];
        len = ref87[1];
        return ref87;
    })(parseBlock(tokens.slice(pointer)));
    /*@817:5*/
    return [['while', expr, s], pointer + len];
};
exports.parse = function(tree) {
    return parseStatements(tree)[0];
};
})();
