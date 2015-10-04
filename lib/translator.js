(function() {
var helperFunctions, pushScope, popScope, register, isObservable, getIdentifiers, getVarName, addFlag, formatCode, getCheckExistenceWrapper, paren, varsDefinition, statements, statement, deleteStatement, expression, assignment, dotOp, composeOp, newOp, array, object, index, funcCall, func, forStatement, forHead, whileStatement, ifStatement, tryStatement, chainCmp, range, lambda, existentialOp, patternMatch, arraypattern, objpattern, classStatement;
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
exports.translate = function() {
    var tree, options, code, vars, output;
    (function(r1) {
        tree = r1[0];
        options = (function() {
            var r2;
            r2 = r1[1];
            if (((typeof r2) === 'undefined') || (r2 == null)) {
                return {};
            };
            return r2;
        })();
        return r1;
    })(arguments);
    /*@2:5*/
    exports.indent = (function() {
        var r3;
        r3 = options.indent;
        if (((typeof r3) === 'undefined') || (r3 == null)) {
            return '    ';
        };
        return r3;
    })();
    /*@3:5*/
    exports.wrapper = (function() {
        var r4;
        r4 = options.wrapper;
        if (((typeof r4) === 'undefined') || (r4 == null)) {
            return true;
        };
        return r4;
    })();
    /*@5:5*/
    exports.flags = {};
    exports.identifiers = getIdentifiers(tree);
    exports.currentScope = {
        vars: [],
        children: [],
        parent: null
    };
    /*@13:5*/
    code = statements(tree);
    vars = popScope();
    output = [varsDefinition(vars), helperFunctions(), code];
    /*@22:5*/
    if (exports.wrapper) {
        output = (function() {
            var r5, i2, l, x1;
            r5 = [];
            r5.push('(function() {');
            l = enumerate(output);
            for (i2 = 0; i2 < l.length; i2++) {
                x1 = l[i2];
                r5.push(x1);
            };
            r5.push('})();');
            return r5;
        })();
    };
    /*@25:5*/
    return output.join('\n') + '\n';
};
helperFunctions = function() {
    var output;
    /*@28:5*/
    output = [];
    if (exports.flags['modulo'] != null) {
        output.push(formatCode([exports.flags['modulo'] + ' = function(a, b) {', ['var c = a % b;', 'return c >= 0 ? c : c + b;'], '}']));
    };
    /*@38:5*/
    if (exports.flags['enumerate'] != null) {
        output.push(formatCode([exports.flags['enumerate'] + ' = function(l) {', ['var t = toString.call(l);', 'if (t !== "[object Array]" && t !== "[object String]")', ['return Object.keys(l);'], 'return l;'], '}']));
    };
    if (exports.flags['inOp'] != null) {
        /*@49:9*/
        output.push(formatCode([exports.flags['inOp'] + ' = function(x, l) {', ['var t = toString.call(l);', 'if (t !== "[object Array]" && t !== "[object String]")', ['return x in l;'], 'return l.indexOf(x) != -1;'], '}']));
    };
    if (exports.flags['compose'] != null) {
        output.push(formatCode([exports.flags['compose'] + ' = function(x, y, c1, c2) {', ['return function() {', ['return x.call(c1, y.apply(c2, arguments));'], '}'], '}']));
    };
    /*@67:5*/
    if (exports.flags['extend'] != null) {
        output.push(formatCode([exports.flags['extend'] + ' = function(x, y) {', ['var copy = function() {};', 'copy.prototype = y.prototype;', 'var c = new copy();', 'c.constructor = x;', 'x.prototype = c;', 'x.prototype.__super__ = y.prototype;', 'x.prototype.__super__.init = y.prototype.constructor;', 'return x;'], '}']));
    };
    if (exports.flags['newOp'] != null) {
        /*@82:9*/
        output.push(formatCode([exports.flags['newOp'] + ' = function(x, a) {', ['var copy = function() { return x.apply(this, a); };', 'copy.prototype = x.prototype;', 'return new copy()'], '}']));
    };
    if (exports.flags['equals'] != null) {
        output.push(formatCode([exports.flags['equals'] + ' = function(a, b) {', ['if (a === b) return true;', 'if (a == null || b == null) return a == b;', 'var t = toString.call(a);', 'if (t !== toString.call(b)) return false;', 'var aa = t === "[object Array]";', 'var ao = t === "[object Object]";', 'if (aa) {', ['if (a.length !== b.length) return false;', 'for (var i = 0; i < a.length; i++)', [('if (!' + exports.flags['equals']) + '(a[i], b[i])) return false;'], 'return true;'], '} else if (ao) {', ['var kk = Object.keys(a);', 'if (kk.length !== Object.keys(b).length) return false;', 'for (var i = 0; i < kk.length; i++) {', ['k = kk[i];', 'if (!(k in b)) return false;', ('if (!' + exports.flags['equals']) + '(a[k], b[k])) return false;'], '}', 'return true;'], '}', 'return false;'], '}']));
    };
    /*@118:5*/
    return output.join('\n');
};

// Scope functions
pushScope = function() {
    var scope;
    /*@123:5*/
    scope = {
        vars: [],
        children: [],
        parent: exports.currentScope
    };
    /*@129:5*/
    exports.currentScope.children.push(scope);
    exports.currentScope = scope;
    return '';
};
/*@133:1*/
popScope = function() {
    var scope;
    if (exports.currentScope == null) {
        return [];
    };
    /*@136:5*/
    scope = exports.currentScope;
    exports.currentScope = scope.parent;
    return scope.vars;
};
/*@140:1*/
register = function(varname) {
    if (!isObservable(varname)) {
        exports.currentScope.vars.push(varname);
    };
    /*@143:5*/
    return varname;
};
isObservable = function() {
    var varname, scope;
    (function(r6) {
        varname = r6[0];
        scope = (function() {
            var r7;
            r7 = r6[1];
            if (((typeof r7) === 'undefined') || (r7 == null)) {
                return exports.currentScope;
            };
            return r7;
        })();
        return r6;
    })(arguments);
    /*@146:5*/
    return (inOp(varname, scope.vars)) || ((scope.parent != null) && isObservable(varname, scope.parent));
};
getIdentifiers = function() {
    var tree, list, i5, l1, x;
    (function(r8) {
        tree = r8[0];
        list = (function() {
            var r9;
            r9 = r8[1];
            if (((typeof r9) === 'undefined') || (r9 == null)) {
                return [];
            };
            return r9;
        })();
        return r8;
    })(arguments);
    /*@151:5*/
    if ((tree[0] === 'identifier') && (!inOp(tree[1], list))) {
        list.push(tree[1]);
    };
    l1 = enumerate(tree);
    for (i5 = 0; i5 < l1.length; i5++) {
        x = l1[i5];
        if (!((x != null) && ((typeof x) === 'object'))) continue;
        /*@155:9*/
        getIdentifiers(x, list);
    };
    return list;
};
/*@159:1*/
getVarName = function(base) {
    var r, i;
    r = base;
    i = 0;
    /*@163:5*/
    while (inOp(r, exports.identifiers)) {
        r = base + (++i);
    };
    exports.identifiers.push(r);
    /*@167:5*/
    return r;
};

// Helper functions
addFlag = function(flag) {
    if (exports.flags[flag] == null) {
        var name;
        /*@173:9*/
        name = getVarName(flag);
        exports.flags[flag] = name;
        return name;
    };
    /*@178:5*/
    return exports.flags[flag];
};
formatCode = function(input) {
    var lineNotEmpty;
    /*@181:5*/
    lineNotEmpty = function(x) {
        return ((typeof x) === 'string') ? (x.trim() !== '') : (x != null);
    };
    return input.filter(lineNotEmpty).map(function(x) {
        return ((typeof x) === 'string') ? x : formatCode(x).split('\n').map(function(y) {
            return exports.indent + y;
        }).join('\n');
    }).join('\n');
};
/*@191:1*/
getCheckExistenceWrapper = function(token) {
    var needTempVar, temp, output;
    needTempVar = !inOp(token[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : token;
    /*@195:5*/
    output = function(tree) {
        var s;
        s = ['statements'];
        if (needTempVar) {
            /*@197:25*/
            s.push(['=', temp, token]);
        };
        s.push(['if', [['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]], ['statements', ['keyword', 'return', ['keyword', 'null']]]]]);
        s.push(['keyword', 'return', tree]);
        /*@207:9*/
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    return [output, temp];
};
/*@211:1*/
paren = function(tree) {
    var list;
    list = ['.', '?.', '()', '?()', '[]', '?[]', 'bool', 'number', 'keyword', 'identifier', 'array', 'object', 'string', '^', '%', '@', 'chaincmp', '??', 'range'];
    if (inOp(tree[0], list)) {
        /*@219:9*/
        return expression(tree);
    };
    return ('(' + expression(tree)) + ')';
};
/*@222:1*/
varsDefinition = function(vars) {
    if (vars.length !== 0) {
        return ('var ' + vars.join(', ')) + ';';
    };
    /*@225:5*/
    return '';
};

// Translator functions
statements = function(tree) {
    var s, i6, l2, node, i;
    /*@230:5*/
    s = [];
    l2 = tree;
    for (i6 in l2) {
        node = l2[i6];
        i = parseInt(i6, 10);
        if (isNaN(i)) i = i6;
        if (!(i >= 1)) continue;
        var code;
        /*@233:9*/
        code = statement(node);
        if (node.offset != null) {
            s.push('//OFFSET' + node.offset);
        };
        /*@237:9*/
        if (code != null) {
            s.push(code + ';');
        };
    };
    /*@240:5*/
    return formatCode(s);
};
statement = function(tree) {
    var type, name;
    /*@243:5*/
    (function(r10) {
        type = r10[0];
        name = r10[1];
        return r10;
    })(tree);
    /*@245:5*/
    if (type === 'keyword') {
        if (name === 'pass') {
            return '';
        };
        /*@247:9*/
        if (name === 'delete') {
            return deleteStatement(tree);
        };
        return tree[1] + (tree[2] ? (' ' + expression(tree[2])) : '');
    } else if (type === 'for') {
        /*@250:9*/
        return forStatement(tree);
    } else if (type === 'while') {
        return whileStatement(tree);
    } else if (type === 'if') {
        /*@254:9*/
        return ifStatement(tree);
    } else if (type === 'try') {
        return tryStatement(tree);
    } else if (type === 'class') {
        /*@258:9*/
        return classStatement(tree);
    } else {
        return expression(tree);
    };
};
/*@262:1*/
deleteStatement = function(tree) {
    var subject, temp, list;
    (function(r11) {
        subject = r11[2];
        return r11;
    })(tree);
    /*@265:5*/
    if ((subject[0] !== '[]') || (subject[2].length === 2)) {
        return 'delete ' + expression(subject);
    };
    temp = ['identifier', getVarName('i')];
    /*@269:5*/
    list = subject[2];
    return forStatement(['for', [temp, null], list, null, ['statements', ['keyword', 'delete', ['[]', subject[1], ['array', temp]]]]]);
};
expression = function(tree) {
    var type, subject;
    /*@276:5*/
    (function(r12) {
        type = r12[0];
        subject = r12[1];
        return r12;
    })(tree);
    /*@278:5*/
    if (inOp(type, ['number', 'bool', 'keyword', 'identifier', 'regex', 'string'])) {
        return subject;
    } else if (inOp(type, ['array', 'arrayfor'])) {
        return array(tree);
    } else if (inOp(type, ['object', 'objectfor'])) {
        /*@283:9*/
        return object(tree);
    } else if (type === 'function') {
        return func(tree);
    } else if (type === '=') {
        /*@287:9*/
        return assignment(tree);
    } else if ((type === '==') || (type === '!=')) {
        var op;
        op = ((tree[2][0] === 'keyword') && (tree[2][1] === 'null')) ? type : (type + '=');
        /*@290:9*/
        return [paren(tree[1]), op, paren(tree[2])].join(' ');
    } else if ((type === 'equals') || (type === 'not equals')) {
        var temp, output;
        temp = ['identifier', addFlag('equals')];
        /*@293:9*/
        output = expression(['()', temp, (function() {
            var r13, i7, l3, x2;
            r13 = [];
            r13.push('array');
            l3 = enumerate(tree.slice(1, 2 + 1));
            for (i7 = 0; i7 < l3.length; i7++) {
                x2 = l3[i7];
                r13.push(x2);
            };
            return r13;
        })()]);
        /*@294:9*/
        return (type === 'equals') ? output : ('!' + output);
    } else if ((type.length === 2) && (type[1] === '=')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === 'lambda') {
        /*@298:9*/
        return lambda(tree);
    } else if (type === '?') {
        return [paren(tree[1]), '?', paren(tree[2]), ':', paren(tree[3])].join(' ');
    } else if (type === '??') {
        /*@302:9*/
        return existentialOp(tree);
    } else if ((type === '||') || (type === '&&')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '!') {
        /*@306:9*/
        return '!' + paren(subject);
    } else if (type === 'chaincmp') {
        return chainCmp(tree);
    } else if ((inOp(type, ['<', '>', '+', '-', '*', '/', 'instanceof'])) && (tree.length === 3)) {
        /*@310:9*/
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '%') {
        var temp;
        temp = ['identifier', addFlag('modulo')];
        /*@313:9*/
        return expression(['()', temp, (function() {
            var r14, i8, l4, x3;
            r14 = [];
            r14.push('array');
            l4 = enumerate(tree.slice(1, 2 + 1));
            for (i8 = 0; i8 < l4.length; i8++) {
                x3 = l4[i8];
                r14.push(x3);
            };
            return r14;
        })()]);
    } else if (type === '@') {
        /*@315:9*/
        return composeOp(tree);
    } else if (type === '^') {
        return expression(['()', ['.', ['identifier', 'Math'], ['identifier', 'pow']], (function() {
            var r15, i9, l5, x4;
            r15 = [];
            r15.push('array');
            l5 = enumerate(tree.slice(1, 2 + 1));
            for (i9 = 0; i9 < l5.length; i9++) {
                x4 = l5[i9];
                r15.push(x4);
            };
            return r15;
        })()]);
    } else if ((type === 'in') || (type === 'not in')) {
        var temp, output;
        /*@322:9*/
        temp = ['identifier', addFlag('inOp')];
        output = expression(['()', temp, (function() {
            var r16, i10, l6, x5;
            r16 = [];
            r16.push('array');
            l6 = enumerate(tree.slice(1, 2 + 1));
            for (i10 = 0; i10 < l6.length; i10++) {
                x5 = l6[i10];
                r16.push(x5);
            };
            return r16;
        })()]);
        /*@324:9*/
        return (type === 'in') ? output : ('!' + output);
    } else if (inOp(type, ['+', '-', '++_', '--_', 'typeof'])) {
        var op;
        op = (type === 'typeof') ? (type + ' ') : type.replace('_', '');
        /*@327:9*/
        return op + paren(subject);
    } else if (type === 'new') {
        return newOp(tree);
    } else if ((type === '_++') || (type === '_--')) {
        /*@331:9*/
        return paren(tree[1]) + type.slice(1);
    } else if (inOp(type, ['.', '?.'])) {
        return dotOp(tree);
    } else if (inOp(type, ['()', '?()'])) {
        /*@335:9*/
        return funcCall(tree);
    } else if (inOp(type, ['[]', '?[]'])) {
        return index(tree);
    } else if (type === 'range') {
        /*@339:9*/
        return range(tree);
    };

    // console.dir(tree, { depth: null })
    return '/*...*/';
};
/*@344:1*/
assignment = function(tree) {
    var left, right, isProperPattern, assignProperArray, assignRange;
    (function(r17) {
        left = r17[1];
        right = r17[2];
        return r17;
    })(tree);
    /*@346:5*/
    isProperPattern = inOp(left[0], ['arraypattern', 'objpattern']);
    assignProperArray = ((!isProperPattern) && (left[0] === '[]')) && ((left[2].length > 2) || left[2].some(function(x) {
        return x[0] === 'spread';
    }));
    /*@349:5*/
    assignRange = assignProperArray && (left[2][0] === 'range');
    if (isProperPattern) {
        return patternMatch(tree);
    };
    /*@352:5*/
    if (equals(left, ['keyword', '_'])) {
        return null;
    };
    if (left[0] === 'identifier') {
        /*@353:33*/
        register(left[1]);
    };
    if (!assignProperArray) {
        return [paren(left), '=', expression(right)].join(' ');
    } else if (assignRange && (left[2][2] == null)) {
        var subject, rtemp, starttemp, lentemp;
        /*@358:9*/
        subject = left[2];
        rtemp = ['identifier', getVarName('r')];
        starttemp = ['identifier', getVarName('start')];
        /*@361:9*/
        lentemp = ['identifier', getVarName('len')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', starttemp, subject[1]], ['=', lentemp, (subject[3] != null) ? ['-', ['+', subject[3], ['number', 1]], starttemp] : ['.', rtemp, ['identifier', 'length']]], ['()', ['.', ['.', ['array'], ['identifier', 'splice']], ['identifier', 'apply']], ['array', rtemp, ['()', ['.', ['array', starttemp, lentemp], ['identifier', 'concat']], ['array', tree[2]]]]], ['keyword', 'return', rtemp]]], ['array']]);
    } else {
        var list, rtemp, listtemp, itemp, jtemp;
        /*@385:9*/
        list = left[2];
        rtemp = ['identifier', getVarName('r')];
        listtemp = ['identifier', getVarName('l')];
        /*@388:9*/
        itemp = ['identifier', getVarName('i')];
        jtemp = ['identifier', getVarName('j')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', listtemp, right], ['for', [itemp, jtemp], list, null, ['statements', ['=', ['[]', rtemp, ['array', jtemp]], ['[]', listtemp, ['array', itemp]]]]], ['keyword', 'return', listtemp]]], []]);
    };
};
/*@400:1*/
dotOp = function(tree) {
    var type, left, right;
    (function(r18) {
        type = r18[0];
        left = r18[1];
        right = r18[2];
        return r18;
    })(tree);
    /*@403:5*/
    if (type[0] !== '?') {
        return [paren(left), '.', expression(right)].join('');
    } else {
        var wrapper, token;
        /*@406:9*/
        (function(r19) {
            wrapper = r19[0];
            token = r19[1];
            return r19;
        })(getCheckExistenceWrapper(left));
        /*@407:9*/
        return wrapper(['.', token, right]);
    };
};
composeOp = function(tree) {
    var left, right, context1, context2, temp;
    /*@410:5*/
    (function(r20) {
        left = r20[1];
        right = r20[2];
        return r20;
    })(tree);
    /*@412:5*/
    context1 = ['keyword', 'null'];
    if (inOp(left[0], ['.', '?.', '[]', '?[]'])) {
        context1 = ['identifier', register(getVarName('r'))];
        /*@415:9*/
        left[1] = ['=', context1, left[1]];
    };
    context2 = ['keyword', 'null'];
    if (inOp(right[0], ['.', '?.', '[]', '?[]'])) {
        /*@419:9*/
        context2 = ['identifier', register(getVarName('r'))];
        right[1] = ['=', context2, right[1]];
    };
    temp = ['identifier', addFlag('compose')];
    /*@423:5*/
    return expression(['()', temp, ['array', left, right, context1, context2]]);
};
newOp = function(tree) {
    var isCall, subject, args, hasSpread, temp;
    /*@426:5*/
    isCall = tree[1][0] === '()';
    (function(r21) {
        (function(r22) {
            subject = r22[1];
            args = r22[2];
            return r22;
        })(r21[1]);
        return r21;
    })(tree);
    /*@429:5*/
    hasSpread = isCall && args.some(function(x) {
        return x[0] === 'spread';
    });
    if ((!isCall) || (!hasSpread)) {
        /*@430:31*/
        return 'new ' + paren(tree[1]);
    };
    temp = ['identifier', addFlag('newOp')];
    return expression(['()', temp, ['array', subject, args]]);
};
/*@435:1*/
array = function(tree) {
    var hasSpread, expr, fortrees, temp, s, ref, i12, l8, t, i;
    hasSpread = tree.some(function(x) {
        return x[0] === 'spread';
    });
    /*@438:5*/
    if ((tree[0] !== 'arrayfor') && (!hasSpread)) {
        return ('[' + tree.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ']';
    };
    /*@441:5*/
    if (hasSpread) {
        var temp, s, i11, l7, expr, i;
        temp = ['identifier', getVarName('r')];
        s = ['statements', ['=', temp, ['array']]];
        /*@445:9*/
        l7 = tree;
        for (i11 in l7) {
            expr = l7[i11];
            i = parseInt(i11, 10);
            if (isNaN(i)) i = i11;
            if (!(i >= 1)) continue;
            /*@446:13*/
            if (expr[0] !== 'spread') {
                s.push(['()', ['.', temp, ['identifier', 'push']], ['array', expr]]);
            } else {
                var xtemp;
                /*@449:17*/
                xtemp = ['identifier', getVarName('x')];
                s.push(['for', [xtemp, null], expr[1], null, ['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', xtemp]]]]);
            };
        };
        /*@454:9*/
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    (function(r23) {
        expr = r23[1];
        fortrees = (2 >= r23.length) ? [] : [].slice.call(r23, 2);
        return r23;
    })(tree);
    /*@458:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['array']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@467:5*/
    l8 = fortrees;
    for (i12 in l8) {
        t = l8[i12];
        i = parseInt(i12, 10);
        if (isNaN(i)) i = i12;
        if (!(i >= 1)) continue;
        /*@468:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', expr]]]);
    /*@476:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
object = function(tree) {
    var key, value, fortrees, temp, s, ref, i14, l9, t, i;
    /*@479:5*/
    if (tree[0] !== 'objectfor') {
        if (tree.length === 1) {
            return '{}';
        };
        /*@481:9*/
        return formatCode(['{', tree.slice(1).map(function() {
            var x, y, i;
            (function(r24) {
                (function(r25) {
                    x = r25[0];
                    y = r25[1];
                    return r25;
                })(r24[0]);
                i = r24[1];
                return r24;
            })(arguments);
            return ((expression(x) + ': ') + expression(y)) + ((i === (tree.length - 2)) ? '' : ',');
        }), '}']);
    };
    /*@485:5*/
    (function(r26) {
        (function(r27) {
            key = r27[0];
            value = r27[1];
            return r27;
        })(r26[1]);
        fortrees = (2 >= r26.length) ? [] : [].slice.call(r26, 2);
        return r26;
    })(tree);
    /*@486:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['object']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@495:5*/
    l9 = fortrees;
    for (i14 in l9) {
        t = l9[i14];
        i = parseInt(i14, 10);
        if (isNaN(i)) i = i14;
        if (!(i >= 1)) continue;
        /*@496:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['=', ['[]', temp, ['array', key]], value]]);
    /*@503:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
index = function(tree) {
    var type, left, right, output, soak, isProperArray, isRange;
    /*@506:5*/
    (function(r28) {
        type = r28[0];
        left = r28[1];
        right = r28[2];
        return r28;
    })(tree);
    /*@507:5*/
    output = null;
    soak = type[0] === '?';
    isProperArray = right.length !== 2;
    /*@510:5*/
    isRange = right[0] === 'range';
    if ((!soak) && (!isProperArray)) {
        return ((paren(left) + '[') + expression(right[1])) + ']';
    };
    /*@515:5*/
    if (!isProperArray) {
        output = function(token) {
            return ['[]', token, right];
        };
    } else if (isRange && (right[2] == null)) {
        var start, end;
        /*@518:9*/
        (function(r29) {
            start = r29[1];
            end = r29[3];
            return r29;
        })(right);
        /*@520:9*/
        if (end == null) {
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start]];
            };
        } else {
            /*@526:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start, ['+', end, ['number', 1]]]];
            };
        };
    } else {
        var itemp;
        /*@531:9*/
        itemp = ['identifier', getVarName('i')];
        output = function(token) {
            return ['arrayfor', ['[]', token, ['array', itemp]], ['for', [itemp, null], right, null]];
        };
    };
    /*@537:5*/
    if (soak) {
        var wrapper, token;
        (function(r30) {
            wrapper = r30[0];
            token = r30[1];
            return r30;
        })(getCheckExistenceWrapper(left));
        /*@539:9*/
        return wrapper(output(token));
    };
    return expression(output(left));
};
/*@543:1*/
funcCall = function(tree) {
    var type, subject, args, output, placeholderCount, hasSpread, callsuper, soak, context;
    (function(r31) {
        type = r31[0];
        subject = r31[1];
        args = r31[2];
        return r31;
    })(tree);
    /*@546:5*/
    output = null;
    placeholderCount = args.filter(function(x) {
        return (equals(x, ['keyword', '_'])) || (equals(x, ['spread', ['keyword', '_']]));
    }).length;
    /*@551:5*/
    hasSpread = args.some(function(x) {
        return x[0] === 'spread';
    });
    callsuper = (inOp(subject[0], ['.', '?.'])) && (equals(subject[1], ['keyword', 'super']));
    /*@554:5*/
    soak = type[0] === '?';
    if (callsuper) {
        subject = ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], subject[2]], ['identifier', 'call']];
        /*@558:9*/
        args.splice(1, 0, ['identifier', 'self']);
    };
    if (((placeholderCount === 0) && (!hasSpread)) && (!soak)) {
        return ((paren(subject) + '(') + args.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ')';
    };
    /*@563:5*/
    context = ['keyword', 'null'];
    if (inOp(subject[0], ['.', '?.', '[]', '?[]'])) {
        context = ['identifier', register(getVarName('r'))];
        /*@566:9*/
        subject[1] = ['=', context, subject[1]];
    };
    if (placeholderCount === 0) {
        if (!hasSpread) {
            /*@570:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'call']], (function() {
                    var r32, i15, l10, x6;
                    r32 = [];
                    r32.push('array');
                    r32.push(context);
                    l10 = enumerate(args.slice(1));
                    for (i15 = 0; i15 < l10.length; i15++) {
                        x6 = l10[i15];
                        r32.push(x6);
                    };
                    return r32;
                })()];
            };
        } else {
            var obj;
            /*@575:13*/
            obj = args;
            if (args.length === 2) {
                obj = args[1][1];
            };
            /*@578:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'apply']], ['array', context, obj]];
            };
        };
    } else {
        var temps;
        /*@583:9*/
        temps = (function() {
            var r33, start1, end1, step1, x7;
            r33 = [];
            start1 = 1;
            end1 = placeholderCount;
            step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
            for (x7 = start1; step1 > 0 ? x7 <= end1 : x7 >= end1; x7 += step1) {
                r33.push(getVarName('x'));
            };
            return r33;
        })();
        /*@585:9*/
        output = function(token) {
            var a, b;
            a = (function() {
                var r34, i16, l11, x8;
                r34 = [];
                r34.push('arraypattern');
                l11 = enumerate(temps.map(function(x) {
                    return [['identifier', x], null];
                }));
                for (i16 = 0; i16 < l11.length; i16++) {
                    x8 = l11[i16];
                    r34.push(x8);
                };
                return r34;
            })();
            /*@587:13*/
            b = args.slice(1).map(function(x) {
                if (equals(x, ['keyword', '_'])) {
                    var temp;
                    temp = temps.splice(0, 1)[0];
                    /*@590:21*/
                    return ['identifier', temp];
                } else if (equals(x, ['spread', ['keyword', '_']])) {
                    var temp;
                    temp = temps.splice(0, 1)[0];
                    /*@593:21*/
                    return ['spread', ['identifier', temp]];
                } else {
                    return x;
                };
            });
            /*@597:13*/
            return ['lambda', null, a, ['()', ['.', token, ['identifier', 'call']], (function() {
                var r35, i17, l12, x9;
                r35 = [];
                r35.push('array');
                r35.push(context);
                l12 = enumerate(b);
                for (i17 = 0; i17 < l12.length; i17++) {
                    x9 = l12[i17];
                    r35.push(x9);
                };
                return r35;
            })()]];
        };
    };
    /*@602:5*/
    if (soak) {
        var wrapper, token;
        (function(r36) {
            wrapper = r36[0];
            token = r36[1];
            return r36;
        })(getCheckExistenceWrapper(subject));
        /*@604:9*/
        return wrapper(output(token));
    };
    return expression(output(subject));
};
/*@610:1*/
// Block constructs
func = function(tree) {
    var identifier, args, s, isProperPattern, output, insert, code, vars;
    (function(r37) {
        identifier = r37[1];
        args = r37[2];
        s = r37[3];
        return r37;
    })(tree);
    /*@612:5*/
    if (identifier != null) {
        identifier = register(expression(identifier));
    };
    isProperPattern = (!args.slice(1).every(function(x) {
        return x[0][0] === 'identifier';
    })) || args.slice(1).some(function(x) {
        return x[1] != null;
    });
    /*@618:5*/
    output = 'function(';
    if (identifier != null) {
        output = (identifier + ' = ') + output;
    };
    /*@622:5*/
    pushScope();
    if (!isProperPattern) {
        var vars, i18, l13, x;
        vars = args.slice(1).map(function(x) {
            return expression(x[0]);
        });
        /*@625:9*/
        l13 = enumerate(vars);
        for (i18 = 0; i18 < l13.length; i18++) {
            x = l13[i18];
            register(x);
        };
        /*@626:9*/
        output += vars.join(', ');
    };
    output += ') {';
    insert = [];
    /*@631:5*/
    if (isProperPattern) {
        var stemp, itemp;
        stemp = ['statements'];
        itemp = ['identifier', getVarName('i')];
        /*@635:9*/
        stemp.push(['=', args, ['keyword', 'arguments']]);
        insert.push(statements(stemp));
    };
    code = [output, [insert.join('\n'), statements(s)], '}'];
    /*@642:5*/
    vars = popScope();
    if (!isProperPattern) {
        vars = vars.filter(function(x) {
            return !args.slice(1).some(function() {
                var y;
                (function(r38) {
                    (function(r39) {
                        (function(r40) {
                            y = r40[1];
                            return r40;
                        })(r39[0]);
                        return r39;
                    })(r38[0]);
                    return r38;
                })(arguments);
                return y === x;
            });
        });
    };
    /*@647:5*/
    code[1].splice(0, 0, varsDefinition(vars));
    return formatCode(code);
};
forStatement = function(tree) {
    var code, vars;
    /*@651:5*/
    code = [forHead(tree), [pushScope() + statements(tree[4])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@657:5*/
    return formatCode(code);
};
forHead = function(tree) {
    var first, second, subject, condition, s, identifierCount, output;
    /*@660:5*/
    (function(r41) {
        (function(r42) {
            first = r42[0];
            second = r42[1];
            return r42;
        })(r41[1]);
        subject = r41[2];
        condition = r41[3];
        s = r41[4];
        return r41;
    })(tree);
    /*@661:5*/
    identifierCount = (second != null) ? 2 : 1;
    output = '';
    if (first[1] === '_') {
        /*@665:9*/
        first = ['identifier', getVarName('x')];
    };
    if ((second != null) && (second[1] === '_')) {
        second = ['identifier', getVarName('y')];
    };
    /*@669:5*/
    if (subject[0] === 'range') {
        var start, next, end, starttemp, endtemp, steptemp, step;
        (function(r43) {
            start = r43[1];
            next = r43[2];
            end = r43[3];
            return r43;
        })(subject);
        /*@672:9*/
        starttemp = ['identifier', getVarName('start')];
        endtemp = (end != null) ? ['identifier', getVarName('end')] : null;
        steptemp = ['identifier', getVarName('step')];
        /*@676:9*/
        step = ['number', 1];
        if (next != null) {
            step = ['-', next, starttemp];
        } else if (end != null) {
            /*@678:30*/
            step = ['?', ['==', endtemp, starttemp], ['number', 1], ['()', ['.', ['identifier', 'Math'], ['identifier', 'sign']], ['array', ['-', endtemp, starttemp]]]];
        };
        s = ['statements', ['=', starttemp, start]];
        if (end != null) {
            /*@689:25*/
            s.push(['=', endtemp, end]);
        };
        s.push(['=', steptemp, step]);
        if (second == null) {
            /*@693:13*/
            output = formatCode([statements(s), ((((((('for (' + statement(['=', first, starttemp])) + '; ') + (end ? ((((((((steptemp[1] + ' > 0 ? ') + expression(first)) + ' <= ') + endtemp[1]) + ' : ') + expression(first)) + ' >= ') + endtemp[1]) : 'true')) + '; ') + expression(first)) + ' += ') + steptemp[1]) + ') {']);
        } else {
            output = formatCode([statements(s), ((((((((('for (' + statement(['=', second, starttemp])) + ', ') + statement(['=', first, ['number', 0]])) + '; ') + (end ? ((((steptemp[1] + ' > 0 ? ') + expression(['<=', second, endtemp])) + ' : ') + expression('>=', second, endtemp)) : 'true')) + '; ') + expression(['+=', second, steptemp])) + ', ') + expression(['_++', first])) + ') {']);
        };
    } else if (identifierCount === 1) {
        var temp, listtemp, itemp;
        /*@707:9*/
        temp = ['identifier', addFlag('enumerate')];
        listtemp = getVarName('l');
        itemp = register(getVarName('i'));
        /*@711:9*/
        s = ['statements', ['=', ['identifier', listtemp], ['()', temp, ['array', subject]]]];
        output = formatCode([statements(s), ((((((('for (' + itemp) + ' = 0; ') + itemp) + ' < ') + listtemp) + '.length; ') + itemp) + '++) {', [statement(['=', first, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';']]);
    } else {
        var itemp, listtemp;
        /*@725:9*/
        itemp = register(getVarName('i'));
        listtemp = getVarName('l');
        s = ['statements', ['=', ['identifier', listtemp], subject]];
        /*@729:9*/
        output = formatCode([statements(s), ((('for (' + itemp) + ' in ') + listtemp) + ') {', [statement(['=', second, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';', statement(['=', first, ['()', ['identifier', 'parseInt'], ['array', ['identifier', itemp], ['number', 10]]]]) + ';', ((('if (isNaN(' + expression(first)) + ')) ') + statement(['=', first, ['identifier', itemp]])) + ';']]);
    };
    if (condition != null) {
        output += (((('\n' + exports.indent) + 'if (!(') + expression(condition)) + ')) continue;');
    };
    /*@748:5*/
    return output;
};
whileStatement = function(tree) {
    var condition, s, code, vars;
    /*@751:5*/
    (function(r44) {
        condition = r44[1];
        s = r44[2];
        return r44;
    })(tree);
    /*@753:5*/
    code = [('while (' + expression(condition)) + ') {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@759:5*/
    return formatCode(code);
};
ifStatement = function(tree) {
    var code, vars, output, i20, l14, condition, s, i;
    /*@762:5*/
    code = [('if (' + expression(tree[1][0])) + ') {', [pushScope() + statements(tree[1][1])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@768:5*/
    output = formatCode(code);
    l14 = tree;
    for (i20 in l14) {
        (function(r45) {
            condition = r45[0];
            s = r45[1];
            return r45;
        })(l14[i20]);
        i = parseInt(i20, 10);
        if (isNaN(i)) i = i20;
        if (!(i >= 2)) continue;
        /*@771:9*/
        code = [(condition === 'else') ? ' else {' : ((' else if (' + expression(condition)) + ') {'), [pushScope() + statements(s)], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@779:9*/
        output += formatCode(code);
    };
    return output;
};
/*@783:1*/
tryStatement = function(tree) {
    var s, catchblock, finallyblock, code, vars, output;
    (function(r46) {
        s = r46[1];
        catchblock = r46[2];
        finallyblock = r46[3];
        return r46;
    })(tree);
    /*@786:5*/
    code = ['try {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@792:5*/
    output = formatCode(code);
    if (catchblock != null) {
        var temp;
        temp = getVarName('e');
        /*@797:9*/
        code = [(' catch (' + temp) + ') {', [pushScope(), (catchblock[0] != null) ? (expression(['=', catchblock[0], ['identifier', temp]]) + ';') : '', statements(catchblock[1])], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@805:9*/
        output += formatCode(code);
    } else {
        var temp;
        temp = getVarName('e');
        /*@808:9*/
        output += ((' catch(' + temp) + ') {}');
    };
    if (finallyblock != null) {
        code = [' finally {', [pushScope() + statements(tree[3])], '}'];
        /*@814:9*/
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        output += formatCode(code);
    };
    /*@819:5*/
    return output;
};

// Rewriter functions
chainCmp = function(tree) {
    var temps, s, i21, l15, x, i, expr, start2, end2, step2;
    /*@824:5*/
    temps = [];
    s = ['statements'];
    l15 = tree;
    for (i21 in l15) {
        x = l15[i21];
        i = parseInt(i21, 10);
        if (isNaN(i)) i = i21;
        if (!(modulo(i, 2) !== 0)) continue;
        var temp;
        /*@828:9*/
        temp = ['identifier', getVarName('r')];
        temps.push(temp);
        s.push(['=', temp, x]);
    };
    /*@832:5*/
    expr = temps[0];
    start2 = 3;
    end2 = tree.length - 1;
    step2 = 5 - start2;
    for (i = start2; step2 > 0 ? i <= end2 : i >= end2; i += step2) {
        /*@834:9*/
        if (i === 3) {
            expr = [tree[i - 1], expr, temps[((i + 1) / 2) - 1]];
        } else {
            expr = ['&&', expr, [tree[i - 1], temps[((i - 1) / 2) - 1], temps[((i + 1) / 2) - 1]]];
        };
    };
    /*@839:5*/
    s.push(['keyword', 'return', expr]);
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
range = function(tree) {
    var temp;
    /*@843:5*/
    temp = ['identifier', getVarName('i')];
    return array(['arrayfor', temp, ['for', [temp, null], tree, null]]);
};
lambda = function(tree) {
    var args, s;
    /*@847:5*/
    (function(r47) {
        args = r47[2];
        s = r47[3];
        return r47;
    })(tree);
    /*@849:5*/
    return func(['function', null, args, ['statements', ['keyword', 'return', s]]]);
};
existentialOp = function(tree) {
    var subject, defaultv, needTempVar, temp, condition;
    /*@855:5*/
    (function(r48) {
        subject = r48[1];
        defaultv = r48[2];
        return r48;
    })(tree);
    /*@857:5*/
    needTempVar = !inOp(subject[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : subject;
    condition = ['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]];
    /*@864:5*/
    if (needTempVar) {
        var s;
        s = ['statements'];
        s.push(['=', temp, subject]);
        /*@867:9*/
        s.push(['if', [condition, ['statements', ['keyword', 'return', defaultv]]]]);
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    /*@874:5*/
    return expression(['?', condition, defaultv, temp]);
};
patternMatch = function(tree) {
    var pattern, subject, temp, s;
    /*@877:5*/
    (function(r49) {
        pattern = r49[1];
        subject = r49[2];
        return r49;
    })(tree);
    /*@879:5*/
    temp = ['identifier', getVarName('r')];
    s = (pattern[0] === 'arraypattern') ? arraypattern(pattern, temp) : objpattern(pattern, temp);
    s.push(['keyword', 'return', temp]);
    /*@883:5*/
    return formatCode([('(function(' + expression(temp)) + ') {', [statements(s)], ('})(' + expression(subject)) + ')']);
};
arraypattern = function(tree, ref) {
    var s, spreadindex, hasSpread, i22, l16, node, i, i23, l17;
    /*@890:5*/
    s = ['statements'];
    spreadindex = tree.map(function(x) {
        return x[0];
    }).indexOf('spread');
    /*@892:5*/
    hasSpread = spreadindex !== (-1);
    if (spreadindex < 0) {
        spreadindex = tree.length;
    };
    /*@895:5*/
    l16 = tree;
    for (i22 in l16) {
        node = l16[i22];
        i = parseInt(i22, 10);
        if (isNaN(i)) i = i22;
        if (!((function() {
        var r50, r51, r52;
        r50 = 1;
        r51 = i;
        r52 = spreadindex;
        return (r50 <= r51) && (r51 < r52);
    })())) continue;
        var isProperPattern, hasDefault, temp;
        /*@896:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@898:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['number', i - 1]]]];
        if (hasDefault) {
            /*@904:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@907:5*/
    if (hasSpread && (!equals(tree[spreadindex][1], ['keyword', '_']))) {
        var isProperPattern, hasDefault, temp;
        node = tree[spreadindex][1];
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        /*@910:9*/
        hasDefault = (!isProperPattern) && (node[1] != null);
        temp = null;
        if (spreadindex === (tree.length - 1)) {
            /*@914:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['.', ref, ['identifier', 'length']]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1]]]]];
        } else {
            var afterspreadcount;
            afterspreadcount = (tree.length - 1) - spreadindex;
            /*@928:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['-', ['.', ref, ['identifier', 'length']], ['number', afterspreadcount]]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1], ['-', ['number', afterspreadcount]]]]]];
        };
        if (hasDefault) {
            temp[2] = ['??', temp[2], node[1]];
        };
        /*@941:9*/
        s.push(temp);
    };
    l17 = tree;
    for (i23 in l17) {
        node = l17[i23];
        i = parseInt(i23, 10);
        if (isNaN(i)) i = i23;
        if (!(spreadindex < i)) continue;
        var isProperPattern, hasDefault, temp;
        /*@944:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@946:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['-', ['.', ref, ['identifier', 'length']], ['number', tree.length - i]]]]];
        if (hasDefault) {
            /*@955:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@958:5*/
    return s;
};
objpattern = function(tree, ref) {
    var s, i24, l18, key, node, i;
    /*@961:5*/
    s = ['statements'];
    l18 = tree;
    for (i24 in l18) {
        (function(r53) {
            key = r53[0];
            node = r53[1];
            return r53;
        })(l18[i24]);
        i = parseInt(i24, 10);
        if (isNaN(i)) i = i24;
        if (!(i >= 1)) continue;
        var isProperPattern, hasDefault, temp;
        /*@964:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@966:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], (key[0] === 'identifier') ? ['.', ref, key] : ['[]', ref, ['array', key]]];
        if (hasDefault) {
            /*@974:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@977:5*/
    return s;
};
classStatement = function(tree) {
    var classname, superclass, functions, constructor, s;
    /*@980:5*/
    (function(r54) {
        classname = r54[1];
        superclass = r54[2];
        functions = r54[3];
        return r54;
    })(tree);
    /*@981:5*/
    if (superclass != null) {
        var temp;
        temp = ['identifier', addFlag('extend')];
    };
    /*@983:5*/
    functions = functions.filter(function(x) {
        return x[0] === 'function';
    }).map(function(f) {
        f[3].splice(1, 0, ['=', ['identifier', 'self'], ['keyword', 'this']]);
        /*@987:9*/
        return f;
    });
    constructor = functions.filter(function(x) {
        return x[1][1] === 'init';
    })[0];
    /*@992:5*/
    if (constructor == null) {
        constructor = ['function', ['identifier', 'init'], ['arraypattern'], ['statements']];
        if (superclass != null) {
            /*@996:13*/
            constructor[3].push(['=', ['identifier', 'self'], ['keyword', 'this']]);
            constructor[3].push(['()', ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], ['identifier', 'init']], ['identifier', 'apply']], ['array', ['identifier', 'self'], ['identifier', 'arguments']]]);
        };
    };
    /*@1005:5*/
    s = ['statements'];
    s.push(constructor);
    if (superclass != null) {
        /*@1008:28*/
        s.push(['()', temp, ['array', ['identifier', 'init'], superclass]]);
    };
    s = s.concat(functions.filter(function(f) {
        return f !== constructor;
    }).map(function(f) {
        var name;
        /*@1014:9*/
        (function(r55) {
            name = r55[0];
            f[1] = r55[1];
            return r55;
        })([f[1], null]);
        /*@1015:9*/
        return ['=', ['.', ['.', ['identifier', 'init'], ['identifier', 'prototype']], name], f];
    }));
    s.push(['keyword', 'return', ['identifier', 'init']]);
    return expression(['=', classname, ['()', ['function', null, ['arraypattern'], s], ['array']]]);
};
})();
