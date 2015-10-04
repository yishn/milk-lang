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
    return typemap.call(null, 'operator', x1);
};
leftdelimitermap = function(x2) {
    return typemap.call(null, 'leftdelimiter', x2);
};
/*@4:1*/
keywordmap = function(x3) {
    return typemap.call(null, 'keyword', x3);
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
    (function(r1) {
        needles = (0 >= (r1.length - 1)) ? [] : [].slice.call(r1, 0, -1);
        hay = r1[r1.length - 1];
        return r1;
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
    (function(r2) {
        needles = (0 >= (r2.length - 1)) ? [] : [].slice.call(r2, 0, -1);
        hay = r2[r2.length - 1];
        return r2;
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
    (function(r3) {
        needles = (0 >= (r3.length - 1)) ? [] : [].slice.call(r3, 0, -1);
        hay = r3[r3.length - 1];
        return r3;
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
        (function(r4) {
            type = r4[0];
            value = r4[1];
            return r4;
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
    (function(r5) {
        tokens = r5[0];
        breakerTokens = (1 >= r5.length) ? [] : [].slice.call(r5, 1);
        return r5;
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
            (function(r6) {
                tree = r6[0];
                len = r6[1];
                return r6;
            })(parseFunction(tokens.slice(i)));
            /*@103:13*/
            return [tree, i + len];
        } else if (assignmentOp.some(function(x) {
            return equals(x, token);
        })) {
            var pattern, tree, len;
            /*@107:13*/
            // Drop everything!
            (function(r7) {
                pattern = r7[0];
                return r7;
            })(parsePattern(tokens.slice(0, (i - 1) + 1)));
            (function(r8) {
                tree = r8[0];
                len = r8[1];
                return r8;
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
            (function(r9) {
                tree = r9[0];
                return r9;
            })(parseLambdaHead(t));
            /*@133:13*/
            output[j] = tree;
        } else if ((equals(token, ['leftdelimiter', '('])) && (inOp((function() {
            var r10;
            r10 = output[j - 1];
            if (((typeof r10) === 'undefined') || (r10 == null)) {
                return null;
            };
            return r10[0];
        })(), [null, 'operator', 'newline']))) {
            var tree;
            /*@138:13*/
            // Expression grouping
            (function(r11) {
                tree = r11[0];
                return r11;
            })(parseExpression(t.slice(1)));
            output[j] = tree;
        } else if ((equals(token, ['leftdelimiter', '('])) || (equals(token, ['leftdelimiter', '?(']))) {
            var tree;
            /*@144:13*/
            // Function call
            (function(r12) {
                tree = r12[0];
                return r12;
            })(parseArray(t.slice(1)));
            output.splice(j, 1, ['operator', token[1] + ')'], tree);
            /*@146:13*/
            j++;
        } else if ((equals(token, ['leftdelimiter', '['])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;

            // Lambda head
            (function(r13) {
                tree = r13[0];
                return r13;
            })(parseArrayPattern(t.slice(1)));
            /*@152:13*/
            output[j] = ['arraypattern', tree];
        } else if ((equals(token, ['leftdelimiter', '['])) || (equals(token, ['leftdelimiter', '?[']))) {
            var indexer, tree;

            // Indexer or array
            indexer = !inOp((function() {
                var r14;
                r14 = output[j - 1];
                if (((typeof r14) === 'undefined') || (r14 == null)) {
                    return null;
                };
                return r14[0];
            })(), [null, 'operator', 'newline']);
            /*@158:13*/
            (function(r15) {
                tree = r15[0];
                return r15;
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
            (function(r16) {
                tree = r16[0];
                return r16;
            })(parseObjectPattern(t.slice(1)));
            output[j] = ['arraypattern', tree];
        } else if (equals(token, ['leftdelimiter', '{'])) {
            var tree;
            /*@173:13*/
            // Object
            (function(r17) {
                tree = r17[0];
                return r17;
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
        (function(r18) {
            body = r18[0];
            return r18;
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
        (function(r19) {
            condition = r19[0];
            return r19;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@202:9*/
        (function(r20) {
            left = r20[0];
            return r20;
        })(parseExpression(output.slice(k + 1, (m - 1) + 1)));
        (function(r21) {
            right = r21[0];
            return r21;
        })(parseExpression(output.slice(m + 1)));
        /*@205:9*/
        output = ['?', condition, left, right];
    } else if ((((k = searchTokenR(['operator', '??'], output)) !== (-1)) || ((k = searchTokenL(['operator', '||'], output)) !== (-1))) || ((k = searchTokenL(['operator', '&&'], output)) !== (-1))) {
        var left, right;
        (function(r22) {
            left = r22[0];
            return r22;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@211:9*/
        (function(r23) {
            right = r23[0];
            return r23;
        })(parseExpression(output.slice(k + 1)));
        output = [output[k][1], left, right];
    } else if ((kk = searchTokens.apply(null, (function() {
        var r24, i8, l4, x4;
        r24 = [];
        l4 = enumerate(comparisonOp);
        for (i8 = 0; i8 < l4.length; i8++) {
            x4 = l4[i8];
            r24.push(x4);
        };
        r24.push(output);
        return r24;
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
            (function(r25) {
                expr = r25[0];
                return r25;
            })(parseExpression(output.slice(start, (kk[m] - 1) + 1)));
            /*@221:13*/
            r.push(expr);
            r.push(output[kk[m]][1]);
        };
        (function(r26) {
            expr = r26[0];
            return r26;
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
        var r27, i10, l6, x5;
        r27 = [];
        l6 = enumerate(elementOp);
        for (i10 = 0; i10 < l6.length; i10++) {
            x5 = l6[i10];
            r27.push(x5);
        };
        r27.push(output);
        return r27;
    })())) !== (-1)) || ((k = searchTokenR(['operator', '@'], output)) !== (-1))) {
        var left, right;
        /*@234:9*/
        (function(r28) {
            left = r28[0];
            return r28;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r29) {
            right = r29[0];
            return r29;
        })(parseExpression(output.slice(k + 1)));
        /*@237:9*/
        output = [output[k][1], left, right];
    } else if ((k = searchTokenL.apply(null, (function() {
        var r30, i11, l7, x6;
        r30 = [];
        l7 = enumerate(additionOp);
        for (i11 = 0; i11 < l7.length; i11++) {
            x6 = l7[i11];
            r30.push(x6);
        };
        r30.push(output);
        return r30;
    })())) !== (-1)) {
        var unary, left, right, len;
        /*@240:9*/
        unary = inOp((function() {
            var r31;
            r31 = output[k - 1];
            if (((typeof r31) === 'undefined') || (r31 == null)) {
                return null;
            };
            return r31[0];
        })(), [null, 'operator', 'leftdelimiter', 'delimiter']);
        /*@241:9*/
        left = null;
        if (!unary) {
            (function(r32) {
                left = r32[0];
                return r32;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
        };
        /*@244:9*/
        (function(r33) {
            right = r33[0];
            len = r33[1];
            return r33;
        })(parseExpression(output.slice(k + 1)));
        /*@246:9*/
        if (unary) {
            (function() {
                var r34, start3, len1;
                r34 = output;
                start3 = k;
                len1 = ((k + len) + 1) - start3;
                [].splice.apply(r34, [start3, len1].concat([[output[k][1], right]]));
                return r34;
            })();
            /*@248:13*/
            (function(r35) {
                output = r35[0];
                return r35;
            })(parseExpression(output));
        } else {
            /*@250:13*/
            output = [output[k][1], left, right];
        };
    } else if ((k = searchTokenL.apply(null, (function() {
        var r36, i12, l8, x7;
        r36 = [];
        l8 = enumerate(multOp);
        for (i12 = 0; i12 < l8.length; i12++) {
            x7 = l8[i12];
            r36.push(x7);
        };
        r36.push(output);
        return r36;
    })())) !== (-1)) {
        var left, right;
        /*@253:9*/
        (function(r37) {
            left = r37[0];
            return r37;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r38) {
            right = r38[0];
            return r38;
        })(parseExpression(output.slice(k + 1)));
        /*@256:9*/
        output = [output[k][1], left, right];
    } else if ((k = searchTokenL.apply(null, (function() {
        var r39, i13, l9, x8;
        r39 = [];
        l9 = enumerate(prepostOp);
        for (i13 = 0; i13 < l9.length; i13++) {
            x8 = l9[i13];
            r39.push(x8);
        };
        r39.push(output);
        return r39;
    })())) !== (-1)) {
        var prevType, nextType, l, prefix, postfix;
        /*@259:9*/
        prevType = (function() {
            var r40;
            r40 = output[k - 1];
            if (((typeof r40) === 'undefined') || (r40 == null)) {
                return null;
            };
            return r40[0];
        })();
        /*@260:9*/
        nextType = (function() {
            var r41;
            r41 = output[k + 1];
            if (((typeof r41) === 'undefined') || (r41 == null)) {
                return null;
            };
            return r41[0];
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
            (function(r42) {
                subject = r42[0];
                return r42;
            })(parseExpression(output.slice(k + 1)));
            /*@273:13*/
            output = [output[k][1] + '_', subject];
        } else {
            var subject;
            (function(r43) {
                subject = r43[0];
                return r43;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
            /*@276:13*/
            output = ['_' + output[k][1], subject];
        };
    } else if ((k = searchTokenL.apply(null, (function() {
        var r44, i14, l10, x9;
        r44 = [];
        l10 = enumerate(unaryOp);
        for (i14 = 0; i14 < l10.length; i14++) {
            x9 = l10[i14];
            r44.push(x9);
        };
        r44.push(output);
        return r44;
    })())) !== (-1)) {
        var subject, len;
        /*@279:9*/
        (function(r45) {
            subject = r45[0];
            len = r45[1];
            return r45;
        })(parseExpression(output.slice(k + 1)));
        /*@281:9*/
        (function() {
            var r46, start4, len2;
            r46 = output;
            start4 = k;
            len2 = ((k + len) + 1) - start4;
            [].splice.apply(r46, [start4, len2].concat([[output[k][1], subject]]));
            return r46;
        })();
        /*@282:9*/
        (function(r47) {
            output = r47[0];
            return r47;
        })(parseExpression(output));
    } else if ((k = searchTokenR(['operator', '^'], output)) !== (-1)) {
        var left, right;
        /*@285:9*/
        (function(r48) {
            left = r48[0];
            return r48;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r49) {
            right = r49[0];
            return r49;
        })(parseExpression(output.slice(k + 1)));
        /*@288:9*/
        output = ['^', left, right];
    } else if ((k = searchTokenR(['operator', 'new'], output)) !== (-1)) {
        var subject, len;
        (function(r50) {
            subject = r50[0];
            len = r50[1];
            return r50;
        })(parseExpression(output.slice(k + 1)));
        /*@292:9*/
        (function() {
            var r51, start5, len3;
            r51 = output;
            start5 = k;
            len3 = ((k + len) + 1) - start5;
            [].splice.apply(r51, [start5, len3].concat([['new', subject]]));
            return r51;
        })();
        /*@293:9*/
        (function(r52) {
            output = r52[0];
            return r52;
        })(parseExpression(output));
    } else if ((k = searchTokenL.apply(null, (function() {
        var r53, i15, l11, x10;
        r53 = [];
        l11 = enumerate(dotOp);
        for (i15 = 0; i15 < l11.length; i15++) {
            x10 = l11[i15];
            r53.push(x10);
        };
        r53.push(output);
        return r53;
    })())) !== (-1)) {
        var left, right;
        /*@296:9*/
        (function(r54) {
            left = r54[0];
            return r54;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r55) {
            right = r55[0];
            return r55;
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
        (function(r56) {
            pattern = r56[0];
            len = r56[1];
            return r56;
        })(parseArrayPattern(tokens.slice(1)));
        /*@313:9*/
        return [pattern, len + 2];
    } else {
        var pattern, len;
        (function(r57) {
            pattern = r57[0];
            len = r57[1];
            return r57;
        })(parsePattern(tokens));
        /*@316:9*/
        return [['arraypattern', [pattern, null]], len];
    };
};

// Pattern matching
parsePattern = function() {
    var tokens, allowDefault, type, value, pointer, expr, len, output;
    (function(r58) {
        tokens = r58[0];
        allowDefault = (function() {
            var r59;
            r59 = r58[1];
            if (((typeof r59) === 'undefined') || (r59 == null)) {
                return false;
            };
            return r59;
        })();
        return r58;
    })(arguments);
    /*@321:5*/
    (function(r60) {
        (function(r61) {
            type = r61[0];
            value = r61[1];
            return r61;
        })(r60[0]);
        return r60;
    })(tokens);
    /*@323:5*/
    if (type === 'leftdelimiter') {
        if (value === '[') {
            var pattern, len;
            (function(r62) {
                pattern = r62[0];
                len = r62[1];
                return r62;
            })(parseArrayPattern(tokens.slice(1)));
            /*@326:13*/
            return [pattern, len + 2];
        } else if (value === '{') {
            var pattern, len;
            (function(r63) {
                pattern = r63[0];
                len = r63[1];
                return r63;
            })(parseObjectPattern(tokens.slice(1)));
            /*@329:13*/
            return [pattern, len + 2];
        };
    };
    pointer = 0;
    /*@332:5*/
    (function(r64) {
        expr = r64[0];
        len = r64[1];
        return r64;
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
        (function(r65) {
            expr = r65[0];
            len = r65[1];
            return r65;
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
            (function(r66) {
                expr = r66[0];
                len = r66[1];
                return r66;
            })(parsePattern(tokens.slice(pointer + 1), true));
            /*@369:13*/
            output.push(['spread', expr]);
            pointer += (len + 1);
        } else {
            var expr, len;
            /*@372:13*/
            (function(r67) {
                expr = r67[0];
                len = r67[1];
                return r67;
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
            (function(r68) {
                expr = r68[0];
                end = r68[1];
                return r68;
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
    (function(r69) {
        expr = r69[0];
        end = r69[1];
        return r69;
    })(parseExpression(tokens, ['operator', '=']));
    /*@407:5*/
    output.push(expr);
    pointer += end;
    defaultv = null;
    /*@411:5*/
    if (equals(tokens[pointer], ['operator', '='])) {
        pointer++;
        (function(r70) {
            expr = r70[0];
            end = r70[1];
            return r70;
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
        (function(r71) {
            pattern = r71[0];
            end = r71[1];
            return r71;
        })(parsePattern(tokens.slice(pointer), true));
        /*@426:9*/
        pointer += end;
        output.push([pattern, null]);
    };
    if (equals(tokens[pointer], ['operator', '='])) {
        /*@430:9*/
        pointer++;
        (function(r72) {
            expr = r72[0];
            end = r72[1];
            return r72;
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
        (function(r73) {
            pattern = r73[0];
            end = r73[1];
            return r73;
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
    (function(r74) {
        statements = r74[0];
        end = r74[1];
        return r74;
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
            (function(r75) {
                forhead = r75[0];
                end = r75[1];
                return r75;
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
            (function(r76) {
                expr = r76[0];
                end = r76[1];
                return r76;
            })(parseExpression(tokens.slice(pointer)));
            /*@504:13*/
            output.push(['spread', expr]);
            pointer += end;
        } else {
            var expr, end;
            /*@507:13*/
            (function(r77) {
                expr = r77[0];
                end = r77[1];
                return r77;
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
            (function(r78) {
                forhead = r78[0];
                end = r78[1];
                return r78;
            })(parseForHead(tokens.slice(pointer)));
            /*@541:13*/
            output.push(forhead);
            pointer += end;
        } else {
            var expr, end;
            /*@544:13*/
            (function(r79) {
                expr = r79[0];
                end = r79[1];
                return r79;
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
            (function(r80) {
                expr = r80[0];
                end = r80[1];
                return r80;
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
        (function(r81) {
            s = r81[0];
            len = r81[1];
            return r81;
        })(parseStatements(tokens.slice(pointer)));
        /*@606:9*/
        return [s, pointer + len];
    } else {
        var s, len;
        (function(r82) {
            s = r82[0];
            len = r82[1];
            return r82;
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
        (function(r83) {
            s = r83[0];
            len = r83[1];
            return r83;
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
    (function(r84) {
        expr = r84[0];
        len = r84[1];
        return r84;
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
        (function(r85) {
            expr = r85[0];
            len = r85[1];
            return r85;
        })(parseExpression(tokens.slice(pointer)));
        /*@691:9*/
        output.push(expr);
        pointer += len;
    } else {
        output.push(null);
    };
    /*@696:5*/
    (function(r86) {
        s = r86[0];
        len = r86[1];
        return r86;
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
    (function(r87) {
        block = r87[0];
        len = r87[1];
        return r87;
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
            (function(r88) {
                pattern = r88[0];
                len = r88[1];
                return r88;
            })(parsePattern(tokens.slice(pointer)));
            /*@724:13*/
            pointer += len;
        };
        (function(r89) {
            block = r89[0];
            len = r89[1];
            return r89;
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
        (function(r90) {
            block = r90[0];
            len = r90[1];
            return r90;
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
    (function(r91) {
        cond = r91[0];
        len = r91[1];
        return r91;
    })(parseExpression(tokens.slice(pointer)));
    /*@747:5*/
    pointer += len;
    (function(r92) {
        block = r92[0];
        len = r92[1];
        return r92;
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
            (function(r93) {
                cond = r93[0];
                len = r93[1];
                return r93;
            })(parseExpression(tokens.slice(pointer)));
            /*@758:13*/
            pointer += len;
            (function(r94) {
                block = r94[0];
                len = r94[1];
                return r94;
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
        (function(r95) {
            block = r95[0];
            len = r95[1];
            return r95;
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
    (function(r96) {
        first = r96[0];
        second = r96[1];
        listexpr = r96[2];
        condition = r96[3];
        return r96;
    })([null, null, null, null]);
    /*@780:5*/
    (function(r97) {
        first = r97[0];
        len = r97[1];
        return r97;
    })(parsePattern(tokens.slice(pointer)));
    /*@781:5*/
    pointer += len;
    if (equals(tokens[pointer], ['delimiter', ','])) {
        pointer++;
        /*@785:9*/
        (function(r98) {
            second = r98[0];
            len = r98[1];
            return r98;
        })(parsePattern(tokens.slice(pointer)));
        /*@786:9*/
        pointer += len;
    };
    if (equals(tokens[pointer], ['operator', 'in'])) {
        pointer++;
        /*@790:9*/
        (function(r99) {
            listexpr = r99[0];
            len = r99[1];
            return r99;
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
        (function(r100) {
            condition = r100[0];
            len = r100[1];
            return r100;
        })(parseExpression(tokens.slice(pointer)));
        /*@800:9*/
        pointer += len;
    };
    return [['for', [first, second], listexpr, condition], pointer];
};
/*@804:1*/
parseFor = function(tokens) {
    var forhead, pointer, s, len;
    (function(r101) {
        forhead = r101[0];
        pointer = r101[1];
        return r101;
    })(parseForHead(tokens));
    /*@806:5*/
    (function(r102) {
        s = r102[0];
        len = r102[1];
        return r102;
    })(parseBlock(tokens.slice(pointer)));
    /*@807:5*/
    forhead.push(s);
    return [forhead, pointer + len];
};
parseWhile = function(tokens) {
    var pointer, expr, len, s;
    /*@812:5*/
    pointer = 1;
    (function(r103) {
        expr = r103[0];
        len = r103[1];
        return r103;
    })(parseExpression(tokens.slice(pointer)));
    /*@814:5*/
    pointer += len;
    (function(r104) {
        s = r104[0];
        len = r104[1];
        return r104;
    })(parseBlock(tokens.slice(pointer)));
    /*@817:5*/
    return [['while', expr, s], pointer + len];
};
exports.parse = function(tree) {
    return parseStatements(tree)[0];
};
})();
