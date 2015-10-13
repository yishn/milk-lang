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
/*@3:1*/
// -*- javascript -*-
typemap = function(type, l) {
    return l.map(function(x) {
        return [type, x];
    });
};
/*@4:1*/
operatormap = function(x1) {
    return typemap.call(null, 'operator', x1);
};
leftdelimitermap = function(x1) {
    return typemap.call(null, 'leftdelimiter', x1);
};
/*@6:1*/
keywordmap = function(x1) {
    return typemap.call(null, 'keyword', x1);
};
assignmentOp = operatormap(['=', '+=', '-=', '*=', '^=', '/=', '%=']);
/*@12:1*/
comparisonOp = operatormap(['<=', '>=', '<', '>', '==', '!=', 'equals', 'not equals']);
elementOp = operatormap(['in', 'instanceof', 'not in']);
additionOp = operatormap(['+', '-']);
/*@20:1*/
multOp = operatormap(['*', '/', '%']);
prepostOp = operatormap(['++', '--']);
unaryOp = operatormap(['typeof', '!']);
/*@23:1*/
dotOp = operatormap(['.', '?.', '()', '?()', '[]', '?[]']);
bracketDel = leftdelimitermap(['[', '?[']);
statementKeywords = keywordmap(['class', 'for', 'while', 'if', 'else', 'else if', 'try', 'catch', 'return', 'throw', 'delete', 'continue', 'pass', 'break']);
/*@31:1*/
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
    /*@37:5*/
    l1 = hay;
    for (i2 in l1) {
        token = l1[i2];
        i = parseInt(i2, 10);
        if (isNaN(i)) i = i2;
        /*@38:9*/
        if (needles.some(function(x) {
            return equals(token.slice(0, (x.length - 1) + 1), x);
        })) {
            return i;
        };
    };
    /*@41:5*/
    return -1;
};
searchTokenL = function() {
    var needles, hay, start1, end1, step, i;
    (function(r1) {
        needles = (0 >= (r1.length - 1)) ? [] : [].slice.call(r1, 0, -1);
        hay = r1[r1.length - 1];
        return r1;
    })(arguments);
    /*@44:5*/
    if (hay.length === 0) {
        return -1;
    };
    start1 = hay.length - 1;
    end1 = 0;
    step = (end1 === start1) ? 1 : Math.sign(end1 - start1);
    for (i = start1; step > 0 ? i <= end1 : i >= end1; i += step) {
        /*@47:9*/
        if (needles.some(function(x) {
            return equals(hay[i].slice(0, (x.length - 1) + 1), x);
        })) {
            return i;
        };
    };
    /*@50:5*/
    return -1;
};
searchTokens = function() {
    var needles, hay, r, i2, l1, token, i;
    (function(r1) {
        needles = (0 >= (r1.length - 1)) ? [] : [].slice.call(r1, 0, -1);
        hay = r1[r1.length - 1];
        return r1;
    })(arguments);
    /*@53:5*/
    r = [];
    l1 = hay;
    for (i2 in l1) {
        token = l1[i2];
        i = parseInt(i2, 10);
        if (isNaN(i)) i = i2;
        /*@56:9*/
        if (needles.some(function(x) {
            return equals(token, x);
        })) {
            r.push(i);
        };
    };
    /*@59:5*/
    return r;
};
searchMatchingDelimiter = function(tokens, index) {
    var delimiter, matchingdel, depth, i1, l1, type, value, i;
    /*@62:5*/
    if (tokens[index][0] !== 'leftdelimiter') {
        return index;
    };
    delimiter = tokens[index][1][tokens[index][1].length - 1];
    /*@65:5*/
    matchingdel = {
        '(': ')',
        '[': ']',
        '{': '}'
    };
    /*@66:5*/
    depth = 0;
    l1 = tokens;
    for (i1 in l1) {
        (function(r1) {
            type = r1[0];
            value = r1[1];
            return r1;
        })(l1[i1]);
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        if (!((i >= index) && (inOp(type, ['leftdelimiter', 'rightdelimiter'])))) continue;
        /*@69:9*/
        if (inOp(value, [delimiter, '?' + delimiter])) {
            depth++;
        } else if (value === matchingdel[delimiter]) {
            depth--;
        };
        /*@73:9*/
        if (depth === 0) {
            return i;
        };
    };
    /*@76:5*/
    return -1;
};
parseExpression = function() {
    var tokens, breakerTokens, output, placeholders, start1, end1, step, i, j, k, kk;
    (function(r1) {
        tokens = r1[0];
        breakerTokens = (1 >= r1.length) ? [] : [].slice.call(r1, 1);
        return r1;
    })(arguments);
    /*@79:5*/
    output = [];
    placeholders = [];

    // Detect delimiters
    start1 = 0;
    end1 = tokens.length - 1;
    step = 1 - start1;
    for (i = start1; step > 0 ? i <= end1 : i >= end1; i += step) {
        var token;
        /*@84:9*/
        token = tokens[i];
        if (((((token[0] === 'delimiter') || (token[0] === 'rightdelimiter')) || (token[0] === 'newline')) || statementKeywords.some(function(x) {
            return equals(x, token);
        })) || breakerTokens.some(function(x) {
            return equals(x, token);
        })) {
            /*@92:13*/
            // Detect end of expression
            break;
        } else if (token[0] === 'leftdelimiter') {
            var j;

            // Make placeholder
            j = searchMatchingDelimiter(tokens, i);
            /*@97:13*/
            placeholders.push(tokens.slice(i, j + 1));
            output.push(['placeholder', placeholders.length - 1]);
            i = j;
            /*@100:13*/
            continue;
        } else if (equals(token, ['keyword', 'function'])) {
            var tree, len;

            // Function closure
            (function(r1) {
                tree = r1[0];
                len = r1[1];
                return r1;
            })(parseFunction(tokens.slice(i)));
            /*@105:13*/
            return [tree, i + len];
        } else if (assignmentOp.some(function(x) {
            return equals(x, token);
        })) {
            var pattern, tree, len;
            /*@109:13*/
            // Drop everything!
            (function(r1) {
                pattern = r1[0];
                return r1;
            })(parsePattern(tokens.slice(0, (i - 1) + 1)));
            (function(r1) {
                tree = r1[0];
                len = r1[1];
                return r1;
            })(parseExpression(tokens.slice(i + 1)));
            /*@112:13*/
            return [[token[1], pattern, tree], (i + 1) + len];
        };
        output.push(token);
    };
    /*@116:5*/
    if (output.length === 0) {
        throw {
            message: 'Expecting an expression here',
            offset: tokens[0].offset
        };
    };
    /*@123:5*/
    // Replace placeholders
    j = -1;
    while ((++j) < output.length) {
        var id, t, token;
        if (output[j][0] !== 'placeholder') {
            /*@125:43*/
            continue;
        };
        id = output[j][1];
        t = placeholders[id];
        /*@129:9*/
        token = t[0];
        if ((equals(token, ['leftdelimiter', '('])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;

            // Lambda head
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseLambdaHead(t));
            /*@135:13*/
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
            /*@140:13*/
            // Expression grouping
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseExpression(t.slice(1)));
            output[j] = tree;
        } else if ((equals(token, ['leftdelimiter', '('])) || (equals(token, ['leftdelimiter', '?(']))) {
            var tree;
            /*@146:13*/
            // Function call
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseArray(t.slice(1)));
            output.splice(j, 1, ['operator', token[1] + ')'], tree);
            /*@148:13*/
            j++;
        } else if ((equals(token, ['leftdelimiter', '['])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;

            // Lambda head
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseArrayPattern(t.slice(1)));
            /*@154:13*/
            output[j] = ['arraypattern', tree];
        } else if ((equals(token, ['leftdelimiter', '['])) || (equals(token, ['leftdelimiter', '?[']))) {
            var indexer, tree;

            // Indexer or array
            indexer = !inOp((function() {
                var r1;
                r1 = output[j - 1];
                if (((typeof r1) === 'undefined') || (r1 == null)) {
                    return null;
                };
                return r1[0];
            })(), [null, 'operator', 'newline']);
            /*@160:13*/
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseArray(t.slice(1)));
            output[j] = tree;
            /*@163:13*/
            if (indexer) {
                output.splice(j, 0, ['operator', token[1] + ']']);
                j++;
            };
        } else if ((equals(token, ['leftdelimiter', '{'])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;
            /*@170:13*/
            // Lambda head
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseObjectPattern(t.slice(1)));
            output[j] = ['arraypattern', tree];
        } else if (equals(token, ['leftdelimiter', '{'])) {
            var tree;
            /*@175:13*/
            // Object
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseObject(t.slice(1)));
            output[j] = tree;
        };
    };
    /*@179:5*/
    // Operator precedence
    if ((k = searchTokenR(['operator', '=>'], output)) !== (-1)) {
        var head, body;
        head = output[k - 1];
        if (head[0] === 'identifier') {
            /*@183:13*/
            head = ['arraypattern', [head, null]];
        } else if (head[0] !== 'arraypattern') {
            throw {
                message: 'Invalid lambda arguments',
                offset: output[k].offset
            };
        };
        /*@191:9*/
        (function(r1) {
            body = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        output = ['lambda', null, head, body];
    } else if ((k = searchTokenR(['operator', '|'], output)) !== (-1)) {
        var left, right;
        /*@196:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@199:9*/
        output = ['()', left, ['array', right]];
    } else if ((k = searchTokenR(['operator', '?'], output)) !== (-1)) {
        var m, condition, left, right;
        m = searchTokenR(['operator', ':'], output.slice(k));
        /*@203:9*/
        if (m < 0) {
            throw {
                message: "Didn't find the ':' to the '?'",
                offset: output[k].offset
            };
        };
        /*@207:9*/
        m += k;
        (function(r1) {
            condition = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@210:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1, (m - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(m + 1)));
        /*@213:9*/
        output = ['?', condition, left, right];
    } else if ((((k = searchTokenR(['operator', '??'], output)) !== (-1)) || ((k = searchTokenL(['operator', '||'], output)) !== (-1))) || ((k = searchTokenL(['operator', '&&'], output)) !== (-1))) {
        var left, right;
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@219:9*/
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        output = [output[k][1], left, right];
    } else if ((kk = searchTokens.apply(null, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(comparisonOp);
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        r1.push(output);
        return r1;
    })())).length > 0) {
        var r, i2, l1, y, m, expr;
        /*@224:9*/
        r = (kk.length > 1) ? ['chaincmp'] : [];
        l1 = kk;
        for (i2 in l1) {
            y = l1[i2];
            m = parseInt(i2, 10);
            if (isNaN(m)) m = i2;
            var start, expr;
            /*@227:13*/
            start = (m >= 1) ? (kk[m - 1] + 1) : 0;
            (function(r1) {
                expr = r1[0];
                return r1;
            })(parseExpression(output.slice(start, (kk[m] - 1) + 1)));
            /*@229:13*/
            r.push(expr);
            r.push(output[kk[m]][1]);
        };
        (function(r1) {
            expr = r1[0];
            return r1;
        })(parseExpression(output.slice(kk[m] + 1)));
        /*@233:9*/
        r.push(expr);
        if (kk.length === 1) {
            output = [r[1], r[0], r[2]];
        } else {
            /*@238:13*/
            output = r;
        };
    } else if (((k = searchTokenL.apply(null, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(elementOp);
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        r1.push(output);
        return r1;
    })())) !== (-1)) || ((k = searchTokenR(['operator', '@'], output)) !== (-1))) {
        var left, right;
        /*@242:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@245:9*/
        output = [output[k][1], left, right];
    } else if ((k = searchTokenL.apply(null, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(additionOp);
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        r1.push(output);
        return r1;
    })())) !== (-1)) {
        var unary, left, right, len;
        /*@248:9*/
        unary = inOp((function() {
            var r1;
            r1 = output[k - 1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[0];
        })(), [null, 'operator', 'leftdelimiter', 'delimiter']);
        /*@249:9*/
        left = null;
        if (!unary) {
            (function(r1) {
                left = r1[0];
                return r1;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
        };
        /*@252:9*/
        (function(r1) {
            right = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@254:9*/
        if (unary) {
            (function() {
                var r1, len1;
                r1 = output;
                start1 = k;
                len1 = ((k + len) + 1) - start1;
                [].splice.apply(r1, [start1, len1].concat([[output[k][1], right]]));
                return r1;
            })();
            /*@256:13*/
            (function(r1) {
                output = r1[0];
                return r1;
            })(parseExpression(output));
        } else {
            /*@258:13*/
            output = [output[k][1], left, right];
        };
    } else if ((k = searchTokenL.apply(null, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(multOp);
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        r1.push(output);
        return r1;
    })())) !== (-1)) {
        var left, right;
        /*@261:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@264:9*/
        output = [output[k][1], left, right];
    } else if ((k = searchTokenL.apply(null, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(prepostOp);
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        r1.push(output);
        return r1;
    })())) !== (-1)) {
        var prevType, nextType, l, prefix, postfix;
        /*@267:9*/
        prevType = (function() {
            var r1;
            r1 = output[k - 1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[0];
        })();
        /*@268:9*/
        nextType = (function() {
            var r1;
            r1 = output[k + 1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[0];
        })();
        /*@270:9*/
        l = [null, 'newline', 'operator'];
        prefix = (inOp(prevType, l)) && (!inOp(nextType, l));
        postfix = (inOp(nextType, l)) && (!inOp(prevType, l));
        /*@274:9*/
        if (prefix === postfix) {
            throw {
                message: ("Ambiguous operator '" + output[k][1]) + "'",
                offset: output[k].offset
            };
        };
        /*@279:9*/
        if (prefix) {
            var subject;
            (function(r1) {
                subject = r1[0];
                return r1;
            })(parseExpression(output.slice(k + 1)));
            /*@281:13*/
            output = [output[k][1] + '_', subject];
        } else {
            var subject;
            (function(r1) {
                subject = r1[0];
                return r1;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
            /*@284:13*/
            output = ['_' + output[k][1], subject];
        };
    } else if ((k = searchTokenL.apply(null, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(unaryOp);
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        r1.push(output);
        return r1;
    })())) !== (-1)) {
        var subject, len;
        /*@287:9*/
        (function(r1) {
            subject = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@289:9*/
        (function() {
            var r1, len1;
            r1 = output;
            start1 = k;
            len1 = ((k + len) + 1) - start1;
            [].splice.apply(r1, [start1, len1].concat([[output[k][1], subject]]));
            return r1;
        })();
        /*@290:9*/
        (function(r1) {
            output = r1[0];
            return r1;
        })(parseExpression(output));
    } else if ((k = searchTokenR(['operator', '^'], output)) !== (-1)) {
        var left, right;
        /*@293:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@296:9*/
        output = ['^', left, right];
    } else if ((k = searchTokenR(['operator', 'new'], output)) !== (-1)) {
        var subject, len;
        (function(r1) {
            subject = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@300:9*/
        (function() {
            var r1, len1;
            r1 = output;
            start1 = k;
            len1 = ((k + len) + 1) - start1;
            [].splice.apply(r1, [start1, len1].concat([['new', subject]]));
            return r1;
        })();
        /*@301:9*/
        (function(r1) {
            output = r1[0];
            return r1;
        })(parseExpression(output));
    } else if ((k = searchTokenL.apply(null, (function() {
        var r1, i2, l1, x1;
        r1 = [];
        l1 = enumerate(dotOp);
        for (i2 = 0; i2 < l1.length; i2++) {
            x1 = l1[i2];
            r1.push(x1);
        };
        r1.push(output);
        return r1;
    })())) !== (-1)) {
        var left, right;
        /*@304:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@307:9*/
        output = [output[k][1], left, right];
    } else {
        if (output.length === 1) {
            output = output[0];
        } else {
            /*@311:15*/
            throw {
                message: "Expression not well-defined",
                offset: tokens[0].offset
            };
        };
    };
    /*@316:5*/
    return [output, i];
};
parseLambdaHead = function(tokens) {
    if (equals(tokens[0], ['leftdelimiter', '('])) {
        var pattern, len;
        /*@320:9*/
        (function(r1) {
            pattern = r1[0];
            len = r1[1];
            return r1;
        })(parseArrayPattern(tokens.slice(1)));
        /*@321:9*/
        return [pattern, len + 2];
    } else {
        var pattern, len;
        (function(r1) {
            pattern = r1[0];
            len = r1[1];
            return r1;
        })(parsePattern(tokens));
        /*@324:9*/
        return [['arraypattern', [pattern, null]], len];
    };
};

// Pattern matching
parsePattern = function() {
    var tokens, allowDefault, type, value, pointer, expr, len, output;
    (function(r1) {
        tokens = r1[0];
        allowDefault = (function() {
            var r2;
            r2 = r1[1];
            if (((typeof r2) === 'undefined') || (r2 == null)) {
                return false;
            };
            return r2;
        })();
        return r1;
    })(arguments);
    /*@329:5*/
    (function(r1) {
        (function(r2) {
            type = r2[0];
            value = r2[1];
            return r2;
        })(r1[0]);
        return r1;
    })(tokens);
    /*@331:5*/
    if (type === 'leftdelimiter') {
        if (value === '[') {
            var pattern, len;
            (function(r1) {
                pattern = r1[0];
                len = r1[1];
                return r1;
            })(parseArrayPattern(tokens.slice(1)));
            /*@334:13*/
            return [pattern, len + 2];
        } else if (value === '{') {
            var pattern, len;
            (function(r1) {
                pattern = r1[0];
                len = r1[1];
                return r1;
            })(parseObjectPattern(tokens.slice(1)));
            /*@337:13*/
            return [pattern, len + 2];
        };
    };
    pointer = 0;
    /*@340:5*/
    (function(r1) {
        expr = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens, ['operator', 'in'], ['operator', '=']));
    /*@341:5*/
    pointer += len;
    output = [expr, null];
    if ((!inOp(expr[0], ['[]', '?[]', '.', '?.', 'identifier'])) && (!equals(expr, ['keyword', '_']))) {
        /*@347:9*/
        throw {
            message: "Invalid pattern",
            offset: tokens[0].offset
        };
    };
    /*@352:5*/
    if (allowDefault && (equals(tokens[pointer], ['operator', '=']))) {
        pointer++;
        (function(r1) {
            expr = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer), ['operator', 'in']));
        /*@355:9*/
        pointer += len;
        output[1] = expr;
    };
    return [allowDefault ? output : output[0], pointer];
};
/*@360:1*/
parseArrayPattern = function(tokens) {
    var output, pointer;
    output = ['arraypattern'];
    pointer = 0;
    /*@364:5*/
    while (pointer < tokens.length) {
        var token;
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            /*@368:13*/
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            pointer++;
        } else if (equals(token, ['delimiter', '...'])) {
            /*@373:13*/
            output.push(['spread', ['keyword', '_']]);
            pointer++;
        } else if (equals(token, ['operator', '*'])) {
            var expr, len;
            /*@376:13*/
            (function(r1) {
                expr = r1[0];
                len = r1[1];
                return r1;
            })(parsePattern(tokens.slice(pointer + 1), true));
            /*@377:13*/
            output.push(['spread', expr]);
            pointer += (len + 1);
        } else {
            var expr, len;
            /*@380:13*/
            (function(r1) {
                expr = r1[0];
                len = r1[1];
                return r1;
            })(parsePattern(tokens.slice(pointer), true));
            /*@381:13*/
            output.push(expr);
            pointer += len;
        };
    };
    /*@384:5*/
    if (output.filter(function(x) {
        return x[0] === 'spread';
    }).length > 1) {
        throw {
            message: "Invalid multiple spreads in an array pattern",
            offset: tokens[0].offset
        };
    };
    /*@389:5*/
    return [output, pointer];
};
parseObjectPattern = function(tokens) {
    var output, pointer;
    /*@392:5*/
    output = ['objpattern'];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@396:9*/
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            /*@402:13*/
            pointer++;
        } else {
            var expr, end;
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseObjectPatternItem(tokens.slice(pointer)));
            /*@405:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@408:5*/
    return [output, pointer];
};
parseObjectPatternItem = function(tokens) {
    var output, pointer, expr, end, defaultv;
    /*@411:5*/
    output = [];
    pointer = 0;
    (function(r1) {
        expr = r1[0];
        end = r1[1];
        return r1;
    })(parseExpression(tokens, ['operator', '=']));
    /*@415:5*/
    output.push(expr);
    pointer += end;
    defaultv = null;
    /*@419:5*/
    if (equals(tokens[pointer], ['operator', '='])) {
        pointer++;
        (function(r1) {
            expr = r1[0];
            end = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@422:9*/
        pointer += end;
        defaultv = expr;
        if (equals(tokens[pointer], ['delimiter', ':'])) {
            /*@426:13*/
            throw {
                message: "Object pattern keys don't have default values",
                offset: tokens[pointer].offset
            };
        };
    };
    /*@431:5*/
    if (equals(tokens[pointer], ['delimiter', ':'])) {
        var pattern;
        pointer++;
        (function(r1) {
            pattern = r1[0];
            end = r1[1];
            return r1;
        })(parsePattern(tokens.slice(pointer), true));
        /*@434:9*/
        pointer += end;
        output.push([pattern, null]);
    };
    if (equals(tokens[pointer], ['operator', '='])) {
        /*@438:9*/
        pointer++;
        (function(r1) {
            expr = r1[0];
            end = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@440:9*/
        pointer += end;
        output[1][1] = expr;
    };
    if (equals(tokens[pointer], ['delimiter', ':'])) {
        /*@444:9*/
        throw {
            message: "Unexpected ':'",
            offset: tokens[pointer].offset
        };
    };
    /*@449:5*/
    if (output.length === 1) {
        var node;
        node = output[0];
        if (node[0] !== 'identifier') {
            /*@452:37*/
            throw {
                message: "Identifier expected",
                offset: tokens[0].offset
            };
        };
        /*@457:9*/
        output = [output[0], [output[0], defaultv]];
    };
    return [output, pointer];
};
/*@463:1*/
// Objects
parseFunction = function(tokens) {
    var output, pointer, statements, end;
    output = ['function'];
    pointer = 1;
    /*@467:5*/
    if (tokens[pointer][0] === 'identifier') {
        output.push(tokens[pointer]);
        pointer++;
    } else {
        /*@471:9*/
        output.push(null);
    };
    if (equals(tokens[pointer], ['leftdelimiter', '('])) {
        var pattern, end;
        /*@474:9*/
        (function(r1) {
            pattern = r1[0];
            end = r1[1];
            return r1;
        })(parseArrayPattern(tokens.slice(pointer + 1)));
        /*@475:9*/
        output.push(pattern);
        pointer += (end + 2);
    } else {
        throw {
            message: "Expecting '('",
            offset: tokens[e].offset
        };
    };
    /*@482:5*/
    (function(r1) {
        statements = r1[0];
        end = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@483:5*/
    output.push(statements);
    pointer += end;
    return [output, pointer];
};
/*@488:1*/
parseArray = function(tokens) {
    var output, pointer;
    output = ['array'];
    pointer = 0;
    /*@492:5*/
    while (pointer < tokens.length) {
        var token;
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            /*@496:13*/
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            pointer++;
        } else if (equals(token, ['keyword', 'for'])) {
            var forhead, end;
            /*@501:13*/
            output[0] = 'arrayfor';
            (function(r1) {
                forhead = r1[0];
                end = r1[1];
                return r1;
            })(parseForHead(tokens.slice(pointer)));
            /*@504:13*/
            output.push(forhead);
            pointer += end;
        } else if (equals(token, ['delimiter', '...'])) {
            output.push(token);
            /*@508:13*/
            pointer++;
        } else if (equals(token, ['operator', '*'])) {
            var expr, end;
            pointer++;
            /*@511:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@512:13*/
            output.push(['spread', expr]);
            pointer += end;
        } else {
            var expr, end;
            /*@515:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@516:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@519:5*/
    if (output.some(function(x) {
        return equals(x, ['delimiter', '...']);
    })) {
        var start, end, next;
        start = output[1];
        /*@521:9*/
        end = (output[output.length - 1][0] === 'delimiter') ? null : output[output.length - 1];
        next = (output[2][0] === 'delimiter') ? null : output[2];
        return [['range', start, next, end], pointer];
    };
    /*@525:5*/
    if ((output[0] === 'arrayfor') && (output[2][0] !== 'for')) {
        throw {
            message: "Expecting 'for' directive",
            offset: tokens[0].offset
        };
    };
    /*@531:5*/
    return [output, pointer];
};
parseObject = function(tokens) {
    var output, pointer;
    /*@534:5*/
    output = ['object'];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@538:9*/
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            /*@544:13*/
            pointer++;
        } else if (equals(token, ['keyword', 'for'])) {
            var forhead, end;
            output[0] = 'objectfor';
            /*@548:13*/
            (function(r1) {
                forhead = r1[0];
                end = r1[1];
                return r1;
            })(parseForHead(tokens.slice(pointer)));
            /*@549:13*/
            output.push(forhead);
            pointer += end;
        } else {
            var expr, end;
            /*@552:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseKeyValuePair(tokens.slice(pointer)));
            /*@553:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@556:5*/
    if ((output[0] === 'objectfor') && (output[2][0] !== 'for')) {
        throw {
            message: "Expecting 'for' directive",
            offset: tokens[0].offset
        };
    };
    /*@562:5*/
    return [output, pointer];
};
parseKeyValuePair = function(tokens) {
    var output, pointer;
    /*@565:5*/
    output = [];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@569:9*/
        token = tokens[pointer];
        if ((((token[0] === 'rightdelimiter') || (token[0] === 'newline')) || (equals(token, ['delimiter', ',']))) || (equals(token, ['keyword', 'for']))) {
            if (output.length > 2) {
                /*@575:35*/
                throw {
                    message: "Object literal has wrong syntax",
                    offset: token.offset
                };
            };
            /*@579:13*/
            break;
        } else if (equals(token, ['delimiter', ':'])) {
            pointer++;
        } else {
            var expr, end;
            /*@583:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@584:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@587:5*/
    if (output.length === 1) {
        var node;
        node = output[0];
        if (node[0] !== 'identifier') {
            /*@590:37*/
            throw {
                message: "Identifier expected",
                offset: tokens[0].offset
            };
        };
        /*@595:9*/
        output = [node, node];
    };
    return [output, pointer];
};
/*@601:1*/
// Statements
parseBlock = function(tokens) {
    var pointer;
    pointer = 0;
    if (!equals(tokens[pointer], ['delimiter', ':'])) {
        /*@605:9*/
        throw {
            message: "Expecting ':'",
            offset: tokens[pointer].offset
        };
    };
    /*@610:5*/
    pointer++;
    if (equals(tokens[pointer], ['newline', 'indent'])) {
        var s, len;
        (function(r1) {
            s = r1[0];
            len = r1[1];
            return r1;
        })(parseStatements(tokens.slice(pointer)));
        /*@614:9*/
        return [s, pointer + len];
    } else {
        var s, len;
        (function(r1) {
            s = r1[0];
            len = r1[1];
            return r1;
        })(parseStatement(tokens.slice(pointer)));
        /*@617:9*/
        return [['statements', s], pointer + len];
    };
};
parseStatements = function(tokens) {
    var output, depth, pointer, end;
    /*@620:5*/
    output = ['statements'];
    depth = 0;
    pointer = 0;
    /*@623:5*/
    end = tokens.length - 1;
    if (equals(tokens[0], ['newline', 'indent'])) {
        var start1, end1, step, i;
        start1 = 1;
        end1 = tokens.length - 1;
        step = 2 - start1;
        for (i = start1; step > 0 ? i <= end1 : i >= end1; i += step) {
            /*@627:13*/
            if (equals(tokens[i], ['newline', 'indent'])) {
                depth++;
            } else if (equals(tokens[i], ['newline', 'dedent'])) {
                depth--;
            };
            /*@632:13*/
            if (depth < 0) {
                end = i;
                break;
            };
        };
    };
    /*@636:5*/
    while (pointer <= end) {
        var s, len;
        if ((tokens[pointer][0] === 'newline') || (equals(tokens[pointer], ['delimiter', ';']))) {
            pointer++;
            /*@640:13*/
            continue;
        };
        (function(r1) {
            s = r1[0];
            len = r1[1];
            return r1;
        })(parseStatement(tokens.slice(pointer)));
        /*@643:9*/
        if (s.length !== 0) {
            output.push(s);
        };
        pointer += len;
    };
    /*@646:5*/
    return [output, end];
};
parseStatement = function(tokens) {
    var token, output;
    /*@649:5*/
    token = tokens[0];
    output = null;
    if (equals(token, ['keyword', 'for'])) {
        /*@653:9*/
        output = parseFor(tokens);
    } else if (equals(token, ['keyword', 'while'])) {
        output = parseWhile(tokens);
    } else if (equals(token, ['keyword', 'class'])) {
        /*@657:9*/
        output = parseClass(tokens);
    } else if (equals(token, ['keyword', 'if'])) {
        output = parseIf(tokens);
    } else if (equals(token, ['keyword', 'try'])) {
        /*@661:9*/
        output = parseTry(tokens);
    } else if (nullKeywords.some(function(x) {
        return equals(x, token);
    })) {
        output = [token, 1];
    } else if (unaryKeywords.some(function(x) {
        return equals(x, token);
    })) {
        /*@665:9*/
        output = parseUnaryKeyword(tokens);
    } else {
        output = parseExpression(tokens);
    };
    /*@669:5*/
    output[0].offset = tokens[0].offset;
    return output;
};
parseUnaryKeyword = function(tokens) {
    var token, expr, len;
    /*@673:5*/
    token = tokens[0];
    if (tokens[1][0] === 'newline') {
        token.push(null);
        /*@677:9*/
        return [token, 1];
    };
    (function(r1) {
        expr = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens.slice(1)));
    /*@680:5*/
    token.push(expr);
    return [token, len + 1];
};
parseClass = function(tokens) {
    var pointer, output, s, len;
    /*@684:5*/
    pointer = 1;
    output = ['class'];
    if (tokens[pointer][0] === 'identifier') {
        /*@688:9*/
        output.push(tokens[pointer]);
        pointer++;
    } else {
        throw {
            message: "Expecting class identifier",
            offset: tokens[pointer].offset
        };
    };
    /*@696:5*/
    if (equals(tokens[pointer], ['keyword', 'extends'])) {
        var expr, len;
        pointer++;
        (function(r1) {
            expr = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@699:9*/
        output.push(expr);
        pointer += len;
    } else {
        output.push(null);
    };
    /*@704:5*/
    (function(r1) {
        s = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@705:5*/
    output.push(s);
    pointer += len;
    if (s.slice(1).some(function(x) {
        return x[0] !== 'function';
    })) {
        /*@709:9*/
        throw {
            message: "Class definitions can only hold functions",
            offset: tokens[0].offset
        };
    };
    /*@714:5*/
    return [output, pointer];
};

// Conditions
parseTry = function(tokens) {
    var pointer, output, block, len;
    /*@719:5*/
    pointer = 1;
    output = ['try'];
    (function(r1) {
        block = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@723:5*/
    output.push(block);
    pointer += (len + 1);
    if (equals(tokens[pointer], ['keyword', 'catch'])) {
        var pattern;
        /*@727:9*/
        pointer++;
        pattern = null;
        if (!equals(tokens[pointer], ['delimiter', ':'])) {
            /*@731:13*/
            (function(r1) {
                pattern = r1[0];
                len = r1[1];
                return r1;
            })(parsePattern(tokens.slice(pointer)));
            /*@732:13*/
            pointer += len;
        };
        (function(r1) {
            block = r1[0];
            len = r1[1];
            return r1;
        })(parseBlock(tokens.slice(pointer)));
        /*@735:9*/
        pointer += (len + 1);
        output.push([pattern, block]);
    } else {
        output.push(null);
    };
    /*@740:5*/
    if (equals(tokens[pointer], ['keyword', 'finally'])) {
        pointer++;
        (function(r1) {
            block = r1[0];
            len = r1[1];
            return r1;
        })(parseBlock(tokens.slice(pointer)));
        /*@743:9*/
        pointer += (len + 1);
        output.push(block);
    } else {
        output.push(null);
    };
    /*@748:5*/
    return [output, pointer - 1];
};
parseIf = function(tokens) {
    var pointer, output, cond, len, block;
    /*@751:5*/
    pointer = 1;
    output = ['if'];
    (function(r1) {
        cond = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens.slice(pointer)));
    /*@755:5*/
    pointer += len;
    (function(r1) {
        block = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@757:5*/
    pointer += (len + 1);
    output.push([cond, block]);
    while (pointer < tokens.length) {
        var token;
        /*@761:9*/
        token = tokens[pointer];
        if (equals(token, ['keyword', 'else if'])) {
            pointer++;
            /*@765:13*/
            (function(r1) {
                cond = r1[0];
                len = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@766:13*/
            pointer += len;
            (function(r1) {
                block = r1[0];
                len = r1[1];
                return r1;
            })(parseBlock(tokens.slice(pointer)));
            /*@768:13*/
            pointer += (len + 1);
            output.push([cond, block]);
        } else {
            break;
        };
    };
    /*@774:5*/
    if (equals(tokens[pointer], ['keyword', 'else'])) {
        pointer++;
        (function(r1) {
            block = r1[0];
            len = r1[1];
            return r1;
        })(parseBlock(tokens.slice(pointer)));
        /*@777:9*/
        pointer += (len + 1);
        output.push(['else', block]);
    };
    return [output, pointer - 1];
};
/*@784:1*/
// Loops
parseForHead = function(tokens) {
    var pointer, first, second, listexpr, condition, len;
    pointer = 1;
    (function(r1) {
        first = r1[0];
        second = r1[1];
        listexpr = r1[2];
        condition = r1[3];
        return r1;
    })([null, null, null, null]);
    /*@788:5*/
    (function(r1) {
        first = r1[0];
        len = r1[1];
        return r1;
    })(parsePattern(tokens.slice(pointer)));
    /*@789:5*/
    pointer += len;
    if (equals(tokens[pointer], ['delimiter', ','])) {
        pointer++;
        /*@793:9*/
        (function(r1) {
            second = r1[0];
            len = r1[1];
            return r1;
        })(parsePattern(tokens.slice(pointer)));
        /*@794:9*/
        pointer += len;
    };
    if (equals(tokens[pointer], ['operator', 'in'])) {
        pointer++;
        /*@798:9*/
        (function(r1) {
            listexpr = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@799:9*/
        pointer += len;
    } else {
        throw {
            message: "Expecting 'in'",
            offset: tokens[pointer].offset
        };
    };
    /*@805:5*/
    if (equals(tokens[pointer], ['keyword', 'if'])) {
        pointer++;
        (function(r1) {
            condition = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@808:9*/
        pointer += len;
    };
    return [['for', [first, second], listexpr, condition], pointer];
};
/*@812:1*/
parseFor = function(tokens) {
    var forhead, pointer, s, len;
    (function(r1) {
        forhead = r1[0];
        pointer = r1[1];
        return r1;
    })(parseForHead(tokens));
    /*@814:5*/
    (function(r1) {
        s = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@815:5*/
    forhead.push(s);
    return [forhead, pointer + len];
};
parseWhile = function(tokens) {
    var pointer, expr, len, s;
    /*@820:5*/
    pointer = 1;
    (function(r1) {
        expr = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens.slice(pointer)));
    /*@822:5*/
    pointer += len;
    (function(r1) {
        s = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@825:5*/
    return [['while', expr, s], pointer + len];
};
exports.parse = function(tree) {
    return parseStatements(tree)[0];
};
})();
