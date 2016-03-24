(function() {
var typemap, operatormap, leftdelimitermap, keywordmap, assignmentOp, comparisonOp, elementOp, additionOp, multOp, prepostOp, unaryOp, dotOp, bracketDel, statementKeywords, unaryKeywords, nullKeywords, searchTokenR, searchTokenL, searchTokens, searchMatchingDelimiter, parseExpression, parseLambdaHead, parsePattern, parseArrayPattern, parseObjectPattern, parseObjectPatternItem, parseFunction, parseArray, parseObject, parseKeyValuePair, parseBlock, parseStatements, parseStatement, parseUnaryKeyword, parseClass, parseTry, parseIf, parseForHead, parseFor, parseWhile;
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
        i = +i2;
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
    step = (end1 === start1) ? 1 : sign(end1 - start1);
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
        i = +i2;
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
        i = +i1;
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
            output.push(tree);
            i += len;
            break;
        } else if (assignmentOp.some(function(x) {
            return equals(x, token);
        })) {
            var pattern, tree, len;
            /*@111:13*/
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
            /*@114:13*/
            return [[token[1], pattern, tree], (i + 1) + len];
        };
        output.push(token);
    };
    /*@118:5*/
    if (output.length === 0) {
        throw {
            message: 'Expecting an expression here',
            offset: tokens[0].offset
        };
    };
    /*@125:5*/
    // Replace placeholders
    j = -1;
    while ((++j) < output.length) {
        var id, t, token;
        if (output[j][0] !== 'placeholder') {
            /*@127:43*/
            continue;
        };
        id = output[j][1];
        t = placeholders[id];
        /*@131:9*/
        token = t[0];
        if ((equals(token, ['leftdelimiter', '('])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;

            // Lambda head
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseLambdaHead(t));
            /*@137:13*/
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
            /*@142:13*/
            // Expression grouping
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseExpression(t.slice(1)));
            output[j] = tree;
        } else if ((equals(token, ['leftdelimiter', '('])) || (equals(token, ['leftdelimiter', '?(']))) {
            var tree;
            /*@148:13*/
            // Function call
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseArray(t.slice(1)));
            output.splice(j, 1, ['operator', token[1] + ')'], tree);
            /*@150:13*/
            j++;
        } else if ((equals(token, ['leftdelimiter', '['])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;

            // Lambda head
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseArrayPattern(t.slice(1)));
            /*@156:13*/
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
            /*@162:13*/
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseArray(t.slice(1)));
            output[j] = tree;
            /*@165:13*/
            if (indexer) {
                output.splice(j, 0, ['operator', token[1] + ']']);
                j++;
            };
        } else if ((equals(token, ['leftdelimiter', '{'])) && (equals(output[j + 1], ['operator', '=>']))) {
            var tree;
            /*@172:13*/
            // Lambda head
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseObjectPattern(t.slice(1)));
            output[j] = ['arraypattern', tree];
        } else if (equals(token, ['leftdelimiter', '{'])) {
            var tree;
            /*@177:13*/
            // Object
            (function(r1) {
                tree = r1[0];
                return r1;
            })(parseObject(t.slice(1)));
            output[j] = tree;
        };
    };
    /*@181:5*/
    // Operator precedence
    if ((k = searchTokenR(['operator', '=>'], output)) !== (-1)) {
        var head, body;
        head = output[k - 1];
        if (head[0] === 'identifier') {
            /*@185:13*/
            head = ['arraypattern', [head, null]];
        } else if (head[0] !== 'arraypattern') {
            throw {
                message: 'Invalid lambda arguments',
                offset: output[k].offset
            };
        };
        /*@193:9*/
        (function(r1) {
            body = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        output = ['lambda', null, head, body];
    } else if ((k = searchTokenR(['operator', '|'], output)) !== (-1)) {
        var left, right;
        /*@198:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@201:9*/
        output = ['()', left, ['array', right]];
    } else if ((k = searchTokenR(['operator', '?'], output)) !== (-1)) {
        var m, condition, left, right;
        m = searchTokenR(['operator', ':'], output.slice(k));
        /*@205:9*/
        if (m < 0) {
            throw {
                message: "Didn't find the ':' to the '?'",
                offset: output[k].offset
            };
        };
        /*@209:9*/
        m += k;
        (function(r1) {
            condition = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@212:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1, (m - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(m + 1)));
        /*@215:9*/
        output = ['?', condition, left, right];
    } else if ((((k = searchTokenR(['operator', '??'], output)) !== (-1)) || ((k = searchTokenL(['operator', '||'], output)) !== (-1))) || ((k = searchTokenL(['operator', '&&'], output)) !== (-1))) {
        var left, right;
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        /*@221:9*/
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
        /*@226:9*/
        r = (kk.length > 1) ? ['chaincmp'] : [];
        l1 = kk;
        for (i2 in l1) {
            y = l1[i2];
            m = +i2;
            if (isNaN(m)) m = i2;
            var start, expr;
            /*@229:13*/
            start = (m >= 1) ? (kk[m - 1] + 1) : 0;
            (function(r1) {
                expr = r1[0];
                return r1;
            })(parseExpression(output.slice(start, (kk[m] - 1) + 1)));
            /*@231:13*/
            r.push(expr);
            r.push(output[kk[m]][1]);
        };
        (function(r1) {
            expr = r1[0];
            return r1;
        })(parseExpression(output.slice(kk[m] + 1)));
        /*@235:9*/
        r.push(expr);
        if (kk.length === 1) {
            output = [r[1], r[0], r[2]];
        } else {
            /*@240:13*/
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
        /*@244:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@247:9*/
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
        /*@250:9*/
        unary = inOp((function() {
            var r1;
            r1 = output[k - 1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[0];
        })(), [null, 'operator', 'leftdelimiter', 'delimiter']);
        /*@251:9*/
        left = null;
        if (!unary) {
            (function(r1) {
                left = r1[0];
                return r1;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
        };
        /*@254:9*/
        (function(r1) {
            right = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@256:9*/
        if (unary) {
            (function() {
                var r1, len1;
                r1 = output;
                start1 = k;
                len1 = ((k + len) + 1) - start1;
                [].splice.apply(r1, [start1, len1].concat([[output[k][1], right]]));
                return r1;
            })();
            /*@258:13*/
            (function(r1) {
                output = r1[0];
                return r1;
            })(parseExpression(output));
        } else {
            /*@260:13*/
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
        /*@263:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@266:9*/
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
        /*@269:9*/
        prevType = (function() {
            var r1;
            r1 = output[k - 1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[0];
        })();
        /*@270:9*/
        nextType = (function() {
            var r1;
            r1 = output[k + 1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[0];
        })();
        /*@272:9*/
        l = [null, 'newline', 'operator'];
        prefix = (inOp(prevType, l)) && (!inOp(nextType, l));
        postfix = (inOp(nextType, l)) && (!inOp(prevType, l));
        /*@276:9*/
        if (prefix === postfix) {
            throw {
                message: ("Ambiguous operator '" + output[k][1]) + "'",
                offset: output[k].offset
            };
        };
        /*@281:9*/
        if (prefix) {
            var subject;
            (function(r1) {
                subject = r1[0];
                return r1;
            })(parseExpression(output.slice(k + 1)));
            /*@283:13*/
            output = [output[k][1] + '_', subject];
        } else {
            var subject;
            (function(r1) {
                subject = r1[0];
                return r1;
            })(parseExpression(output.slice(0, (k - 1) + 1)));
            /*@286:13*/
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
        /*@289:9*/
        (function(r1) {
            subject = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@291:9*/
        (function() {
            var r1, len1;
            r1 = output;
            start1 = k;
            len1 = ((k + len) + 1) - start1;
            [].splice.apply(r1, [start1, len1].concat([[output[k][1], subject]]));
            return r1;
        })();
        /*@292:9*/
        (function(r1) {
            output = r1[0];
            return r1;
        })(parseExpression(output));
    } else if ((k = searchTokenR(['operator', '^'], output)) !== (-1)) {
        var left, right;
        /*@295:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@298:9*/
        output = ['^', left, right];
    } else if ((k = searchTokenR(['operator', 'new'], output)) !== (-1)) {
        var subject, len;
        (function(r1) {
            subject = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@302:9*/
        (function() {
            var r1, len1;
            r1 = output;
            start1 = k;
            len1 = ((k + len) + 1) - start1;
            [].splice.apply(r1, [start1, len1].concat([['new', subject]]));
            return r1;
        })();
        /*@303:9*/
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
        /*@306:9*/
        (function(r1) {
            left = r1[0];
            return r1;
        })(parseExpression(output.slice(0, (k - 1) + 1)));
        (function(r1) {
            right = r1[0];
            return r1;
        })(parseExpression(output.slice(k + 1)));
        /*@309:9*/
        output = [output[k][1], left, right];
    } else {
        if (output.length === 1) {
            output = output[0];
        } else {
            /*@313:15*/
            throw {
                message: "Expression not well-defined",
                offset: tokens[0].offset
            };
        };
    };
    /*@318:5*/
    return [output, i];
};
parseLambdaHead = function(tokens) {
    if (equals(tokens[0], ['leftdelimiter', '('])) {
        var pattern, len;
        /*@322:9*/
        (function(r1) {
            pattern = r1[0];
            len = r1[1];
            return r1;
        })(parseArrayPattern(tokens.slice(1)));
        /*@323:9*/
        return [pattern, len + 2];
    } else {
        var pattern, len;
        (function(r1) {
            pattern = r1[0];
            len = r1[1];
            return r1;
        })(parsePattern(tokens));
        /*@326:9*/
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
    /*@331:5*/
    (function(r1) {
        (function(r2) {
            type = r2[0];
            value = r2[1];
            return r2;
        })(r1[0]);
        return r1;
    })(tokens);
    /*@333:5*/
    if (type === 'leftdelimiter') {
        if (value === '[') {
            var pattern, len;
            (function(r1) {
                pattern = r1[0];
                len = r1[1];
                return r1;
            })(parseArrayPattern(tokens.slice(1)));
            /*@336:13*/
            return [pattern, len + 2];
        } else if (value === '{') {
            var pattern, len;
            (function(r1) {
                pattern = r1[0];
                len = r1[1];
                return r1;
            })(parseObjectPattern(tokens.slice(1)));
            /*@339:13*/
            return [pattern, len + 2];
        };
    };
    pointer = 0;
    /*@342:5*/
    (function(r1) {
        expr = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens, ['operator', 'in'], ['operator', '=']));
    /*@343:5*/
    pointer += len;
    output = [expr, null];
    if ((!inOp(expr[0], ['[]', '?[]', '.', '?.', 'identifier'])) && (!equals(expr, ['keyword', '_']))) {
        /*@349:9*/
        throw {
            message: "Invalid pattern",
            offset: tokens[0].offset
        };
    };
    /*@354:5*/
    if (allowDefault && (equals(tokens[pointer], ['operator', '=']))) {
        pointer++;
        (function(r1) {
            expr = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer), ['operator', 'in']));
        /*@357:9*/
        pointer += len;
        output[1] = expr;
    };
    return [allowDefault ? output : output[0], pointer];
};
/*@362:1*/
parseArrayPattern = function(tokens) {
    var output, pointer;
    output = ['arraypattern'];
    pointer = 0;
    /*@366:5*/
    while (pointer < tokens.length) {
        var token;
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            /*@370:13*/
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            pointer++;
        } else if (equals(token, ['delimiter', '...'])) {
            /*@375:13*/
            output.push(['spread', ['keyword', '_']]);
            pointer++;
        } else if (equals(token, ['operator', '*'])) {
            var expr, len;
            /*@378:13*/
            (function(r1) {
                expr = r1[0];
                len = r1[1];
                return r1;
            })(parsePattern(tokens.slice(pointer + 1), true));
            /*@379:13*/
            output.push(['spread', expr]);
            pointer += (len + 1);
        } else {
            var expr, len;
            /*@382:13*/
            (function(r1) {
                expr = r1[0];
                len = r1[1];
                return r1;
            })(parsePattern(tokens.slice(pointer), true));
            /*@383:13*/
            output.push(expr);
            pointer += len;
        };
    };
    /*@386:5*/
    if (output.filter(function(x) {
        return x[0] === 'spread';
    }).length > 1) {
        throw {
            message: "Invalid multiple spreads in an array pattern",
            offset: tokens[0].offset
        };
    };
    /*@391:5*/
    return [output, pointer];
};
parseObjectPattern = function(tokens) {
    var output, pointer;
    /*@394:5*/
    output = ['objpattern'];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@398:9*/
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            /*@404:13*/
            pointer++;
        } else {
            var expr, end;
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseObjectPatternItem(tokens.slice(pointer)));
            /*@407:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@410:5*/
    return [output, pointer];
};
parseObjectPatternItem = function(tokens) {
    var output, pointer, expr, end, defaultv;
    /*@413:5*/
    output = [];
    pointer = 0;
    (function(r1) {
        expr = r1[0];
        end = r1[1];
        return r1;
    })(parseExpression(tokens, ['operator', '=']));
    /*@417:5*/
    output.push(expr);
    pointer += end;
    defaultv = null;
    /*@421:5*/
    if (equals(tokens[pointer], ['operator', '='])) {
        pointer++;
        (function(r1) {
            expr = r1[0];
            end = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@424:9*/
        pointer += end;
        defaultv = expr;
        if (equals(tokens[pointer], ['delimiter', ':'])) {
            /*@428:13*/
            throw {
                message: "Object pattern keys don't have default values",
                offset: tokens[pointer].offset
            };
        };
    };
    /*@433:5*/
    if (equals(tokens[pointer], ['delimiter', ':'])) {
        var pattern;
        pointer++;
        (function(r1) {
            pattern = r1[0];
            end = r1[1];
            return r1;
        })(parsePattern(tokens.slice(pointer), true));
        /*@436:9*/
        pointer += end;
        output.push([pattern, null]);
    };
    if (equals(tokens[pointer], ['operator', '='])) {
        /*@440:9*/
        pointer++;
        (function(r1) {
            expr = r1[0];
            end = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@442:9*/
        pointer += end;
        output[1][1] = expr;
    };
    if (equals(tokens[pointer], ['delimiter', ':'])) {
        /*@446:9*/
        throw {
            message: "Unexpected ':'",
            offset: tokens[pointer].offset
        };
    };
    /*@451:5*/
    if (output.length === 1) {
        var node;
        node = output[0];
        if (node[0] !== 'identifier') {
            /*@454:37*/
            throw {
                message: "Identifier expected",
                offset: tokens[0].offset
            };
        };
        /*@459:9*/
        output = [output[0], [output[0], defaultv]];
    };
    return [output, pointer];
};
/*@465:1*/
// Objects
parseFunction = function(tokens) {
    var output, pointer, statements, end;
    output = ['function'];
    pointer = 1;
    /*@469:5*/
    if (tokens[pointer][0] === 'identifier') {
        output.push(tokens[pointer]);
        pointer++;
    } else {
        /*@473:9*/
        output.push(null);
    };
    if (equals(tokens[pointer], ['leftdelimiter', '('])) {
        var pattern, end;
        /*@476:9*/
        (function(r1) {
            pattern = r1[0];
            end = r1[1];
            return r1;
        })(parseArrayPattern(tokens.slice(pointer + 1)));
        /*@477:9*/
        output.push(pattern);
        pointer += (end + 2);
    } else {
        throw {
            message: "Expecting '('",
            offset: tokens[e].offset
        };
    };
    /*@484:5*/
    (function(r1) {
        statements = r1[0];
        end = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@485:5*/
    output.push(statements);
    pointer += end;
    return [output, pointer];
};
/*@490:1*/
parseArray = function(tokens) {
    var output, pointer;
    output = ['array'];
    pointer = 0;
    /*@494:5*/
    while (pointer < tokens.length) {
        var token;
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            /*@498:13*/
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            pointer++;
        } else if (equals(token, ['keyword', 'for'])) {
            var forhead, end;
            /*@503:13*/
            output[0] = 'arrayfor';
            (function(r1) {
                forhead = r1[0];
                end = r1[1];
                return r1;
            })(parseForHead(tokens.slice(pointer)));
            /*@506:13*/
            output.push(forhead);
            pointer += end;
        } else if (equals(token, ['delimiter', '...'])) {
            output.push(token);
            /*@510:13*/
            pointer++;
        } else if (equals(token, ['operator', '*'])) {
            var expr, end;
            pointer++;
            /*@513:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@514:13*/
            output.push(['spread', expr]);
            pointer += end;
        } else {
            var expr, end;
            /*@517:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@518:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@521:5*/
    if (output.some(function(x) {
        return equals(x, ['delimiter', '...']);
    })) {
        var start, end, next;
        start = output[1];
        /*@523:9*/
        end = (output[output.length - 1][0] === 'delimiter') ? null : output[output.length - 1];
        next = (output[2][0] === 'delimiter') ? null : output[2];
        return [['range', start, next, end], pointer];
    };
    /*@527:5*/
    if ((output[0] === 'arrayfor') && (output[2][0] !== 'for')) {
        throw {
            message: "Expecting 'for' directive",
            offset: tokens[0].offset
        };
    };
    /*@533:5*/
    return [output, pointer];
};
parseObject = function(tokens) {
    var output, pointer;
    /*@536:5*/
    output = ['object'];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@540:9*/
        token = tokens[pointer];
        if (token[0] === 'rightdelimiter') {
            break;
        } else if ((equals(token, ['delimiter', ','])) || (token[0] === 'newline')) {
            /*@546:13*/
            pointer++;
        } else if (equals(token, ['keyword', 'for'])) {
            var forhead, end;
            output[0] = 'objectfor';
            /*@550:13*/
            (function(r1) {
                forhead = r1[0];
                end = r1[1];
                return r1;
            })(parseForHead(tokens.slice(pointer)));
            /*@551:13*/
            output.push(forhead);
            pointer += end;
        } else {
            var expr, end;
            /*@554:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseKeyValuePair(tokens.slice(pointer)));
            /*@555:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@558:5*/
    if ((output[0] === 'objectfor') && (output[2][0] !== 'for')) {
        throw {
            message: "Expecting 'for' directive",
            offset: tokens[0].offset
        };
    };
    /*@564:5*/
    return [output, pointer];
};
parseKeyValuePair = function(tokens) {
    var output, pointer;
    /*@567:5*/
    output = [];
    pointer = 0;
    while (pointer < tokens.length) {
        var token;
        /*@571:9*/
        token = tokens[pointer];
        if ((((token[0] === 'rightdelimiter') || (token[0] === 'newline')) || (equals(token, ['delimiter', ',']))) || (equals(token, ['keyword', 'for']))) {
            if (output.length > 2) {
                /*@577:35*/
                throw {
                    message: "Object literal has wrong syntax",
                    offset: token.offset
                };
            };
            /*@581:13*/
            break;
        } else if (equals(token, ['delimiter', ':'])) {
            pointer++;
        } else {
            var expr, end;
            /*@585:13*/
            (function(r1) {
                expr = r1[0];
                end = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@586:13*/
            output.push(expr);
            pointer += end;
        };
    };
    /*@589:5*/
    if (output.length === 1) {
        var node;
        node = output[0];
        if (node[0] !== 'identifier') {
            /*@592:37*/
            throw {
                message: "Identifier expected",
                offset: tokens[0].offset
            };
        };
        /*@597:9*/
        output = [node, node];
    };
    return [output, pointer];
};
/*@603:1*/
// Statements
parseBlock = function(tokens) {
    var pointer;
    pointer = 0;
    if (!equals(tokens[pointer], ['delimiter', ':'])) {
        /*@607:9*/
        throw {
            message: "Expecting ':'",
            offset: tokens[pointer].offset
        };
    };
    /*@612:5*/
    pointer++;
    if (equals(tokens[pointer], ['newline', 'indent'])) {
        var s, len;
        (function(r1) {
            s = r1[0];
            len = r1[1];
            return r1;
        })(parseStatements(tokens.slice(pointer)));
        /*@616:9*/
        return [s, pointer + len];
    } else {
        var s, len;
        (function(r1) {
            s = r1[0];
            len = r1[1];
            return r1;
        })(parseStatement(tokens.slice(pointer)));
        /*@619:9*/
        return [['statements', s], pointer + len];
    };
};
parseStatements = function(tokens) {
    var output, depth, pointer, end;
    /*@622:5*/
    output = ['statements'];
    depth = 0;
    pointer = 0;
    /*@625:5*/
    end = tokens.length - 1;
    if (equals(tokens[0], ['newline', 'indent'])) {
        var start1, end1, step, i;
        start1 = 1;
        end1 = tokens.length - 1;
        step = 2 - start1;
        for (i = start1; step > 0 ? i <= end1 : i >= end1; i += step) {
            /*@629:13*/
            if (equals(tokens[i], ['newline', 'indent'])) {
                depth++;
            } else if (equals(tokens[i], ['newline', 'dedent'])) {
                depth--;
            };
            /*@634:13*/
            if (depth < 0) {
                end = i;
                break;
            };
        };
    };
    /*@638:5*/
    while (pointer <= end) {
        var s, len;
        if ((tokens[pointer][0] === 'newline') || (equals(tokens[pointer], ['delimiter', ';']))) {
            pointer++;
            /*@642:13*/
            continue;
        };
        (function(r1) {
            s = r1[0];
            len = r1[1];
            return r1;
        })(parseStatement(tokens.slice(pointer)));
        /*@645:9*/
        if (s.length !== 0) {
            output.push(s);
        };
        pointer += len;
    };
    /*@648:5*/
    return [output, end];
};
parseStatement = function(tokens) {
    var token, output;
    /*@651:5*/
    token = tokens[0];
    output = null;
    if (equals(token, ['keyword', 'for'])) {
        /*@655:9*/
        output = parseFor(tokens);
    } else if (equals(token, ['keyword', 'while'])) {
        output = parseWhile(tokens);
    } else if (equals(token, ['keyword', 'class'])) {
        /*@659:9*/
        output = parseClass(tokens);
    } else if (equals(token, ['keyword', 'if'])) {
        output = parseIf(tokens);
    } else if (equals(token, ['keyword', 'try'])) {
        /*@663:9*/
        output = parseTry(tokens);
    } else if (nullKeywords.some(function(x) {
        return equals(x, token);
    })) {
        output = [token, 1];
    } else if (unaryKeywords.some(function(x) {
        return equals(x, token);
    })) {
        /*@667:9*/
        output = parseUnaryKeyword(tokens);
    } else {
        output = parseExpression(tokens);
    };
    /*@671:5*/
    output[0].offset = tokens[0].offset;
    return output;
};
parseUnaryKeyword = function(tokens) {
    var token, expr, len;
    /*@675:5*/
    token = tokens[0];
    if (tokens[1][0] === 'newline') {
        token.push(null);
        /*@679:9*/
        return [token, 1];
    };
    (function(r1) {
        expr = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens.slice(1)));
    /*@682:5*/
    token.push(expr);
    return [token, len + 1];
};
parseClass = function(tokens) {
    var pointer, output, s, len;
    /*@686:5*/
    pointer = 1;
    output = ['class'];
    if (tokens[pointer][0] === 'identifier') {
        /*@690:9*/
        output.push(tokens[pointer]);
        pointer++;
    } else {
        throw {
            message: "Expecting class identifier",
            offset: tokens[pointer].offset
        };
    };
    /*@698:5*/
    if (equals(tokens[pointer], ['keyword', 'extends'])) {
        var expr, len;
        pointer++;
        (function(r1) {
            expr = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@701:9*/
        output.push(expr);
        pointer += len;
    } else {
        output.push(null);
    };
    /*@706:5*/
    (function(r1) {
        s = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@707:5*/
    output.push(s);
    pointer += len;
    if (s.slice(1).some(function(x) {
        return x[0] !== 'function';
    })) {
        /*@711:9*/
        throw {
            message: "Class definitions can only hold functions",
            offset: tokens[0].offset
        };
    };
    /*@716:5*/
    return [output, pointer];
};

// Conditions
parseTry = function(tokens) {
    var pointer, output, block, len;
    /*@721:5*/
    pointer = 1;
    output = ['try'];
    (function(r1) {
        block = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@725:5*/
    output.push(block);
    pointer += (len + 1);
    if (equals(tokens[pointer], ['keyword', 'catch'])) {
        var pattern;
        /*@729:9*/
        pointer++;
        pattern = null;
        if (!equals(tokens[pointer], ['delimiter', ':'])) {
            /*@733:13*/
            (function(r1) {
                pattern = r1[0];
                len = r1[1];
                return r1;
            })(parsePattern(tokens.slice(pointer)));
            /*@734:13*/
            pointer += len;
        };
        (function(r1) {
            block = r1[0];
            len = r1[1];
            return r1;
        })(parseBlock(tokens.slice(pointer)));
        /*@737:9*/
        pointer += (len + 1);
        output.push([pattern, block]);
    } else {
        output.push(null);
    };
    /*@742:5*/
    if (equals(tokens[pointer], ['keyword', 'finally'])) {
        pointer++;
        (function(r1) {
            block = r1[0];
            len = r1[1];
            return r1;
        })(parseBlock(tokens.slice(pointer)));
        /*@745:9*/
        pointer += (len + 1);
        output.push(block);
    } else {
        output.push(null);
    };
    /*@750:5*/
    return [output, pointer - 1];
};
parseIf = function(tokens) {
    var pointer, output, cond, len, block;
    /*@753:5*/
    pointer = 1;
    output = ['if'];
    (function(r1) {
        cond = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens.slice(pointer)));
    /*@757:5*/
    pointer += len;
    (function(r1) {
        block = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@759:5*/
    pointer += (len + 1);
    output.push([cond, block]);
    while (pointer < tokens.length) {
        var token;
        /*@763:9*/
        token = tokens[pointer];
        if (equals(token, ['keyword', 'else if'])) {
            pointer++;
            /*@767:13*/
            (function(r1) {
                cond = r1[0];
                len = r1[1];
                return r1;
            })(parseExpression(tokens.slice(pointer)));
            /*@768:13*/
            pointer += len;
            (function(r1) {
                block = r1[0];
                len = r1[1];
                return r1;
            })(parseBlock(tokens.slice(pointer)));
            /*@770:13*/
            pointer += (len + 1);
            output.push([cond, block]);
        } else {
            break;
        };
    };
    /*@776:5*/
    if (equals(tokens[pointer], ['keyword', 'else'])) {
        pointer++;
        (function(r1) {
            block = r1[0];
            len = r1[1];
            return r1;
        })(parseBlock(tokens.slice(pointer)));
        /*@779:9*/
        pointer += (len + 1);
        output.push(['else', block]);
    };
    return [output, pointer - 1];
};
/*@786:1*/
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
    /*@790:5*/
    (function(r1) {
        first = r1[0];
        len = r1[1];
        return r1;
    })(parsePattern(tokens.slice(pointer)));
    /*@791:5*/
    pointer += len;
    if (equals(tokens[pointer], ['delimiter', ','])) {
        pointer++;
        /*@795:9*/
        (function(r1) {
            second = r1[0];
            len = r1[1];
            return r1;
        })(parsePattern(tokens.slice(pointer)));
        /*@796:9*/
        pointer += len;
    };
    if (equals(tokens[pointer], ['operator', 'in'])) {
        pointer++;
        /*@800:9*/
        (function(r1) {
            listexpr = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@801:9*/
        pointer += len;
    } else {
        throw {
            message: "Expecting 'in'",
            offset: tokens[pointer].offset
        };
    };
    /*@807:5*/
    if (equals(tokens[pointer], ['keyword', 'if'])) {
        pointer++;
        (function(r1) {
            condition = r1[0];
            len = r1[1];
            return r1;
        })(parseExpression(tokens.slice(pointer)));
        /*@810:9*/
        pointer += len;
    };
    return [['for', [first, second], listexpr, condition], pointer];
};
/*@814:1*/
parseFor = function(tokens) {
    var forhead, pointer, s, len;
    (function(r1) {
        forhead = r1[0];
        pointer = r1[1];
        return r1;
    })(parseForHead(tokens));
    /*@816:5*/
    (function(r1) {
        s = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@817:5*/
    forhead.push(s);
    return [forhead, pointer + len];
};
parseWhile = function(tokens) {
    var pointer, expr, len, s;
    /*@822:5*/
    pointer = 1;
    (function(r1) {
        expr = r1[0];
        len = r1[1];
        return r1;
    })(parseExpression(tokens.slice(pointer)));
    /*@824:5*/
    pointer += len;
    (function(r1) {
        s = r1[0];
        len = r1[1];
        return r1;
    })(parseBlock(tokens.slice(pointer)));
    /*@827:5*/
    return [['while', expr, s], pointer + len];
};
exports.parse = function(tree) {
    return parseStatements(tree)[0];
};
})();
