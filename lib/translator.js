(function() {
var helperFunctions, pushScope, popScope, register, isObservable, getIdentifiers, getVarName, addFlag, formatCode, getCheckExistenceWrapper, paren, varsDefinition, statements, statement, deleteStatement, expression, assignment, dotOp, newOp, array, object, index, funcCall, func, forStatement, forHead, whileStatement, ifStatement, tryStatement, chainCmp, range, lambda, existentialOp, patternMatch, arraypattern, objpattern, classStatement;
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
    (function(ref1) {
        tree = ref1[0];
        options = (function() {
            var r1;
            r1 = ref1[1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1;
        })();
        return ref1;
    })(arguments);
    /*@2:5*/
    exports.indent = (function() {
        var r2;
        r2 = (function() {
            if (((typeof options) === 'undefined') || (options == null)) {
                return null;
            };
            return options.indent;
        })();
        if (((typeof r2) === 'undefined') || (r2 == null)) {
            return '    ';
        };
        return r2;
    })();
    /*@3:5*/
    exports.wrapper = (function() {
        var r3;
        r3 = (function() {
            if (((typeof options) === 'undefined') || (options == null)) {
                return null;
            };
            return options.wrapper;
        })();
        if (((typeof r3) === 'undefined') || (r3 == null)) {
            return true;
        };
        return r3;
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
            var r4, i2, l, x1;
            r4 = [];
            r4.push('(function() {');
            l = enumerate(output);
            for (i2 = 0; i2 < l.length; i2++) {
                x1 = l[i2];
                r4.push(x1);
            };
            r4.push('})();');
            return r4;
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
        output.push(formatCode([exports.flags['compose'] + ' = function(x, y) {', ['return function() {', ['if (arguments.length <= 1)', ['return x(y(arguments[0]));'], 'return x(y.apply(this, arguments));'], '}'], '}']));
    };
    /*@69:5*/
    if (exports.flags['extend'] != null) {
        output.push(formatCode([exports.flags['extend'] + ' = function(x, y) {', ['var copy = function() {};', 'copy.prototype = y.prototype;', 'var c = new copy();', 'c.constructor = x;', 'x.prototype = c;', 'x.prototype.__super__ = y.prototype;', 'x.prototype.__super__.init = y.prototype.constructor;', 'return x;'], '}']));
    };
    if (exports.flags['newOp'] != null) {
        /*@84:9*/
        output.push(formatCode([exports.flags['newOp'] + ' = function(x, a) {', ['var copy = function() { return x.apply(this, a); };', 'copy.prototype = x.prototype;', 'return new copy()'], '}']));
    };
    if (exports.flags['equals'] != null) {
        output.push(formatCode([exports.flags['equals'] + ' = function(a, b) {', ['if (a === b) return true;', 'if (a == null || b == null) return a == b;', 'var t = toString.call(a);', 'if (t !== toString.call(b)) return false;', 'var aa = t === "[object Array]";', 'var ao = t === "[object Object]";', 'if (aa) {', ['if (a.length !== b.length) return false;', 'for (var i = 0; i < a.length; i++)', [('if (!' + exports.flags['equals']) + '(a[i], b[i])) return false;'], 'return true;'], '} else if (ao) {', ['var kk = Object.keys(a);', 'if (kk.length !== Object.keys(b).length) return false;', 'for (var i = 0; i < kk.length; i++) {', ['k = kk[i];', 'if (!(k in b)) return false;', ('if (!' + exports.flags['equals']) + '(a[k], b[k])) return false;'], '}', 'return true;'], '}', 'return false;'], '}']));
    };
    /*@120:5*/
    return output.join('\n');
};

// Scope functions
pushScope = function() {
    var scope;
    /*@125:5*/
    scope = {
        vars: [],
        children: [],
        parent: exports.currentScope
    };
    /*@131:5*/
    exports.currentScope.children.push(scope);
    exports.currentScope = scope;
    return '';
};
/*@135:1*/
popScope = function() {
    var scope;
    if (exports.currentScope == null) {
        return [];
    };
    /*@138:5*/
    scope = exports.currentScope;
    exports.currentScope = scope.parent;
    return scope.vars;
};
/*@142:1*/
register = function(varname) {
    if (!isObservable(varname)) {
        exports.currentScope.vars.push(varname);
    };
    /*@145:5*/
    return varname;
};
isObservable = function() {
    var varname, scope;
    (function(ref2) {
        varname = ref2[0];
        scope = (function() {
            var r5;
            r5 = ref2[1];
            if (((typeof r5) === 'undefined') || (r5 == null)) {
                return exports.currentScope;
            };
            return r5;
        })();
        return ref2;
    })(arguments);
    /*@148:5*/
    return (inOp(varname, scope.vars)) || ((scope.parent != null) && isObservable(varname, scope.parent));
};
getIdentifiers = function() {
    var tree, list, i5, l1, x;
    (function(ref3) {
        tree = ref3[0];
        list = (function() {
            var r6;
            r6 = ref3[1];
            if (((typeof r6) === 'undefined') || (r6 == null)) {
                return [];
            };
            return r6;
        })();
        return ref3;
    })(arguments);
    /*@153:5*/
    if ((tree[0] === 'identifier') && (!inOp(tree[1], list))) {
        list.push(tree[1]);
    };
    l1 = enumerate(tree);
    for (i5 = 0; i5 < l1.length; i5++) {
        x = l1[i5];
        if (!((x != null) && ((typeof x) === 'object'))) continue;
        /*@157:9*/
        getIdentifiers(x, list);
    };
    return list;
};
/*@161:1*/
getVarName = function(base) {
    var r, i;
    r = base;
    i = 0;
    /*@165:5*/
    while (inOp(r, exports.identifiers)) {
        r = base + (++i);
    };
    exports.identifiers.push(r);
    /*@169:5*/
    return r;
};

// Helper functions
addFlag = function(flag) {
    if (exports.flags[flag] == null) {
        var name;
        /*@175:9*/
        name = getVarName(flag);
        exports.flags[flag] = name;
        return name;
    };
    /*@180:5*/
    return exports.flags[flag];
};
formatCode = function(input) {
    var lineNotEmpty;
    /*@183:5*/
    lineNotEmpty = function(x) {
        return ((typeof x) === 'string') ? (x.trim() !== '') : (x != null);
    };
    return input.filter(lineNotEmpty).map(function(x) {
        return ((typeof x) === 'string') ? x : formatCode(x).split('\n').map(function(y) {
            return exports.indent + y;
        }).join('\n');
    }).join('\n');
};
/*@193:1*/
getCheckExistenceWrapper = function(token) {
    var needTempVar, temp, output;
    needTempVar = !inOp(token[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : token;
    /*@197:5*/
    output = function(tree) {
        var s;
        s = ['statements'];
        if (needTempVar) {
            /*@199:25*/
            s.push(['=', temp, token]);
        };
        s.push(['if', [['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]], ['statements', ['keyword', 'return', ['keyword', 'null']]]]]);
        s.push(['keyword', 'return', tree]);
        /*@209:9*/
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    return [output, temp];
};
/*@213:1*/
paren = function(tree) {
    var list;
    list = ['.', '?.', '()', '?()', '[]', '?[]', 'bool', 'number', 'keyword', 'identifier', 'array', 'object', 'string', '^', '%', '@', 'chaincmp', '??', 'range'];
    if (inOp(tree[0], list)) {
        /*@221:9*/
        return expression(tree);
    };
    return ('(' + expression(tree)) + ')';
};
/*@224:1*/
varsDefinition = function(vars) {
    if (vars.length !== 0) {
        return ('var ' + vars.join(', ')) + ';';
    };
    /*@227:5*/
    return '';
};

// Translator functions
statements = function(tree) {
    var s, i6, l2, node, i;
    /*@232:5*/
    s = [];
    l2 = tree;
    for (i6 in l2) {
        node = l2[i6];
        i = parseInt(i6, 10);
        if (isNaN(i)) i = i6;
        if (!(i >= 1)) continue;
        var code;
        /*@235:9*/
        code = statement(node);
        if (node.offset != null) {
            s.push('//OFFSET' + node.offset);
        };
        /*@239:9*/
        if (code != null) {
            s.push(code + ';');
        };
    };
    /*@242:5*/
    return formatCode(s);
};
statement = function(tree) {
    var type, name;
    /*@245:5*/
    (function(ref4) {
        type = ref4[0];
        name = ref4[1];
        return ref4;
    })(tree);
    /*@247:5*/
    if (type === 'keyword') {
        if (name === 'pass') {
            return '';
        };
        /*@249:9*/
        if (name === 'delete') {
            return deleteStatement(tree);
        };
        return tree[1] + (tree[2] ? (' ' + expression(tree[2])) : '');
    } else if (type === 'for') {
        /*@252:9*/
        return forStatement(tree);
    } else if (type === 'while') {
        return whileStatement(tree);
    } else if (type === 'if') {
        /*@256:9*/
        return ifStatement(tree);
    } else if (type === 'try') {
        return tryStatement(tree);
    } else if (type === 'class') {
        /*@260:9*/
        return classStatement(tree);
    } else {
        return expression(tree);
    };
};
/*@264:1*/
deleteStatement = function(tree) {
    var subject, temp, list;
    (function(ref5) {
        subject = ref5[2];
        return ref5;
    })(tree);
    /*@267:5*/
    if ((subject[0] !== '[]') || (subject[2].length === 2)) {
        return 'delete ' + expression(subject);
    };
    temp = ['identifier', getVarName('i')];
    /*@271:5*/
    list = subject[2];
    return forStatement(['for', [temp, null], list, null, ['statements', ['keyword', 'delete', ['[]', subject[1], ['array', temp]]]]]);
};
expression = function(tree) {
    var type, subject;
    /*@278:5*/
    (function(ref6) {
        type = ref6[0];
        subject = ref6[1];
        return ref6;
    })(tree);
    /*@280:5*/
    if (inOp(type, ['number', 'bool', 'keyword', 'identifier', 'regex', 'string'])) {
        return subject;
    } else if (inOp(type, ['array', 'arrayfor'])) {
        return array(tree);
    } else if (inOp(type, ['object', 'objectfor'])) {
        /*@285:9*/
        return object(tree);
    } else if (type === 'function') {
        return func(tree);
    } else if (type === '=') {
        /*@289:9*/
        return assignment(tree);
    } else if ((type === '==') || (type === '!=')) {
        var op;
        op = ((tree[2][0] === 'keyword') && (tree[2][1] === 'null')) ? type : (type + '=');
        /*@292:9*/
        return [paren(tree[1]), op, paren(tree[2])].join(' ');
    } else if ((type === 'equals') || (type === 'not equals')) {
        var temp, output;
        temp = ['identifier', addFlag('equals')];
        /*@295:9*/
        output = expression(['()', temp, (function() {
            var r7, i7, l3, x2;
            r7 = [];
            r7.push('array');
            l3 = enumerate(tree.slice(1, 2 + 1));
            for (i7 = 0; i7 < l3.length; i7++) {
                x2 = l3[i7];
                r7.push(x2);
            };
            return r7;
        })()]);
        /*@296:9*/
        return (type === 'equals') ? output : ('!' + output);
    } else if ((type.length === 2) && (type[1] === '=')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === 'lambda') {
        /*@300:9*/
        return lambda(tree);
    } else if (type === '?') {
        return [paren(tree[1]), '?', paren(tree[2]), ':', paren(tree[3])].join(' ');
    } else if (type === '??') {
        /*@304:9*/
        return existentialOp(tree);
    } else if ((type === '||') || (type === '&&')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '!') {
        /*@308:9*/
        return '!' + paren(subject);
    } else if (type === 'chaincmp') {
        return chainCmp(tree);
    } else if ((inOp(type, ['<', '>', '+', '-', '*', '/', 'instanceof'])) && (tree.length === 3)) {
        /*@312:9*/
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '%') {
        var temp;
        temp = ['identifier', addFlag('modulo')];
        /*@315:9*/
        return expression(['()', temp, (function() {
            var r8, i8, l4, x3;
            r8 = [];
            r8.push('array');
            l4 = enumerate(tree.slice(1, 2 + 1));
            for (i8 = 0; i8 < l4.length; i8++) {
                x3 = l4[i8];
                r8.push(x3);
            };
            return r8;
        })()]);
    } else if (type === '@') {
        var temp;
        /*@317:9*/
        temp = ['identifier', addFlag('compose')];
        return expression(['()', temp, (function() {
            var r9, i9, l5, x4;
            r9 = [];
            r9.push('array');
            l5 = enumerate(tree.slice(1, 2 + 1));
            for (i9 = 0; i9 < l5.length; i9++) {
                x4 = l5[i9];
                r9.push(x4);
            };
            return r9;
        })()]);
    } else if (type === '^') {
        /*@320:9*/
        return expression(['()', ['.', ['identifier', 'Math'], ['identifier', 'pow']], (function() {
            var r10, i10, l6, x5;
            r10 = [];
            r10.push('array');
            l6 = enumerate(tree.slice(1, 2 + 1));
            for (i10 = 0; i10 < l6.length; i10++) {
                x5 = l6[i10];
                r10.push(x5);
            };
            return r10;
        })()]);
    } else if ((type === 'in') || (type === 'not in')) {
        var temp, output;
        /*@325:9*/
        temp = ['identifier', addFlag('inOp')];
        output = expression(['()', temp, (function() {
            var r11, i11, l7, x6;
            r11 = [];
            r11.push('array');
            l7 = enumerate(tree.slice(1, 2 + 1));
            for (i11 = 0; i11 < l7.length; i11++) {
                x6 = l7[i11];
                r11.push(x6);
            };
            return r11;
        })()]);
        /*@327:9*/
        return (type === 'in') ? output : ('!' + output);
    } else if (inOp(type, ['+', '-', '++_', '--_', 'typeof'])) {
        var op;
        op = (type === 'typeof') ? (type + ' ') : type.replace('_', '');
        /*@330:9*/
        return op + paren(subject);
    } else if (type === 'new') {
        return newOp(tree);
    } else if ((type === '_++') || (type === '_--')) {
        /*@334:9*/
        return paren(tree[1]) + type.slice(1);
    } else if (inOp(type, ['.', '?.'])) {
        return dotOp(tree);
    } else if (inOp(type, ['()', '?()'])) {
        /*@338:9*/
        return funcCall(tree);
    } else if (inOp(type, ['[]', '?[]'])) {
        return index(tree);
    } else if (type === 'range') {
        /*@342:9*/
        return range(tree);
    };

    // console.dir(tree, { depth: null })
    return '/*...*/';
};
/*@347:1*/
assignment = function(tree) {
    var left, right, isProperPattern, assignProperArray, assignRange;
    (function(ref7) {
        left = ref7[1];
        right = ref7[2];
        return ref7;
    })(tree);
    /*@349:5*/
    isProperPattern = inOp(left[0], ['arraypattern', 'objpattern']);
    assignProperArray = ((!isProperPattern) && (left[0] === '[]')) && ((left[2].length > 2) || left[2].some(function(x) {
        return x[0] === 'spread';
    }));
    /*@352:5*/
    assignRange = assignProperArray && (left[2][0] === 'range');
    if (isProperPattern) {
        return patternMatch(tree);
    };
    /*@355:5*/
    if (equals(left, ['keyword', '_'])) {
        return null;
    };
    if (left[0] === 'identifier') {
        /*@356:33*/
        register(left[1]);
    };
    if (!assignProperArray) {
        return [paren(left), '=', expression(right)].join(' ');
    } else if (assignRange && (left[2][2] == null)) {
        var subject, rtemp, starttemp, lentemp;
        /*@361:9*/
        subject = left[2];
        rtemp = ['identifier', getVarName('r')];
        starttemp = ['identifier', getVarName('start')];
        /*@364:9*/
        lentemp = ['identifier', getVarName('len')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', starttemp, subject[1]], ['=', lentemp, (subject[3] != null) ? ['-', ['+', subject[3], ['number', 1]], starttemp] : ['.', rtemp, ['identifier', 'length']]], ['()', ['.', ['.', ['array'], ['identifier', 'splice']], ['identifier', 'apply']], ['array', rtemp, ['()', ['.', ['array', starttemp, lentemp], ['identifier', 'concat']], ['array', tree[2]]]]], ['keyword', 'return', rtemp]]], ['array']]);
    } else {
        var list, rtemp, listtemp, itemp, jtemp;
        /*@388:9*/
        list = left[2];
        rtemp = ['identifier', getVarName('r')];
        listtemp = ['identifier', getVarName('l')];
        /*@391:9*/
        itemp = ['identifier', getVarName('i')];
        jtemp = ['identifier', getVarName('j')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', listtemp, right], ['for', [itemp, jtemp], list, null, ['statements', ['=', ['[]', rtemp, ['array', jtemp]], ['[]', listtemp, ['array', itemp]]]]], ['keyword', 'return', listtemp]]], []]);
    };
};
/*@403:1*/
dotOp = function(tree) {
    var type, left, right;
    (function(ref8) {
        type = ref8[0];
        left = ref8[1];
        right = ref8[2];
        return ref8;
    })(tree);
    /*@406:5*/
    if (type[0] !== '?') {
        return [paren(left), '.', expression(right)].join('');
    } else {
        var wrapper, token;
        /*@409:9*/
        (function(ref9) {
            wrapper = ref9[0];
            token = ref9[1];
            return ref9;
        })(getCheckExistenceWrapper(left));
        /*@410:9*/
        return wrapper(['.', token, right]);
    };
};
newOp = function(tree) {
    var isCall, subject, args, hasSpread, temp;
    /*@413:5*/
    isCall = tree[1][0] === '()';
    (function(ref10) {
        (function(ref11) {
            subject = ref11[1];
            args = ref11[2];
            return ref11;
        })(ref10[1]);
        return ref10;
    })(tree);
    /*@416:5*/
    hasSpread = isCall && args.some(function(x) {
        return x[0] === 'spread';
    });
    if ((!isCall) || (!hasSpread)) {
        /*@417:31*/
        return 'new ' + paren(tree[1]);
    };
    temp = ['identifier', addFlag('newOp')];
    return expression(['()', temp, ['array', subject, args]]);
};
/*@422:1*/
array = function(tree) {
    var hasSpread, expr, fortrees, temp, s, ref, i13, l9, t, i;
    hasSpread = tree.some(function(x) {
        return x[0] === 'spread';
    });
    /*@425:5*/
    if ((tree[0] !== 'arrayfor') && (!hasSpread)) {
        return ('[' + tree.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ']';
    };
    /*@428:5*/
    if (hasSpread) {
        var temp, s, i12, l8, expr, i;
        temp = ['identifier', getVarName('r')];
        s = ['statements', ['=', temp, ['array']]];
        /*@432:9*/
        l8 = tree;
        for (i12 in l8) {
            expr = l8[i12];
            i = parseInt(i12, 10);
            if (isNaN(i)) i = i12;
            if (!(i >= 1)) continue;
            /*@433:13*/
            if (expr[0] !== 'spread') {
                s.push(['()', ['.', temp, ['identifier', 'push']], ['array', expr]]);
            } else {
                var xtemp;
                /*@436:17*/
                xtemp = ['identifier', getVarName('x')];
                s.push(['for', [xtemp, null], expr[1], null, ['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', xtemp]]]]);
            };
        };
        /*@441:9*/
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    (function(ref12) {
        expr = ref12[1];
        fortrees = (2 >= ref12.length) ? [] : [].slice.call(ref12, 2);
        return ref12;
    })(tree);
    /*@445:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['array']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@454:5*/
    l9 = fortrees;
    for (i13 in l9) {
        t = l9[i13];
        i = parseInt(i13, 10);
        if (isNaN(i)) i = i13;
        if (!(i >= 1)) continue;
        /*@455:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', expr]]]);
    /*@463:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
object = function(tree) {
    var key, value, fortrees, temp, s, ref, i15, l10, t, i;
    /*@466:5*/
    if (tree[0] !== 'objectfor') {
        if (tree.length === 1) {
            return '{}';
        };
        /*@468:9*/
        return formatCode(['{', tree.slice(1).map(function() {
            var x, y, i;
            (function(ref13) {
                (function(ref14) {
                    x = ref14[0];
                    y = ref14[1];
                    return ref14;
                })(ref13[0]);
                i = ref13[1];
                return ref13;
            })(arguments);
            return ((expression(x) + ': ') + expression(y)) + ((i === (tree.length - 2)) ? '' : ',');
        }), '}']);
    };
    /*@472:5*/
    (function(ref15) {
        (function(ref16) {
            key = ref16[0];
            value = ref16[1];
            return ref16;
        })(ref15[1]);
        fortrees = (2 >= ref15.length) ? [] : [].slice.call(ref15, 2);
        return ref15;
    })(tree);
    /*@473:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['object']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@482:5*/
    l10 = fortrees;
    for (i15 in l10) {
        t = l10[i15];
        i = parseInt(i15, 10);
        if (isNaN(i)) i = i15;
        if (!(i >= 1)) continue;
        /*@483:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['=', ['[]', temp, ['array', key]], value]]);
    /*@490:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
index = function(tree) {
    var type, left, right, output, soak, isProperArray, isRange;
    /*@493:5*/
    (function(ref17) {
        type = ref17[0];
        left = ref17[1];
        right = ref17[2];
        return ref17;
    })(tree);
    /*@494:5*/
    output = null;
    soak = type[0] === '?';
    isProperArray = right.length !== 2;
    /*@497:5*/
    isRange = right[0] === 'range';
    if ((!soak) && (!isProperArray)) {
        return ((paren(left) + '[') + expression(right[1])) + ']';
    };
    /*@502:5*/
    if (!isProperArray) {
        output = function(token) {
            return ['[]', token, right];
        };
    } else if (isRange && (right[2] == null)) {
        var start, end;
        /*@505:9*/
        (function(ref18) {
            start = ref18[1];
            end = ref18[3];
            return ref18;
        })(right);
        /*@507:9*/
        if (end == null) {
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start]];
            };
        } else {
            /*@513:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start, ['+', end, ['number', 1]]]];
            };
        };
    } else {
        var itemp;
        /*@518:9*/
        itemp = ['identifier', getVarName('i')];
        output = function(token) {
            return ['arrayfor', ['[]', token, ['array', itemp]], ['for', [itemp, null], right, null]];
        };
    };
    /*@524:5*/
    if (soak) {
        var wrapper, token;
        (function(ref19) {
            wrapper = ref19[0];
            token = ref19[1];
            return ref19;
        })(getCheckExistenceWrapper(left));
        /*@526:9*/
        return wrapper(output(token));
    };
    return expression(output(left));
};
/*@530:1*/
funcCall = function(tree) {
    var type, subject, args, output, placeholderCount, hasSpread, callsuper, soak, context;
    (function(ref20) {
        type = ref20[0];
        subject = ref20[1];
        args = ref20[2];
        return ref20;
    })(tree);
    /*@533:5*/
    output = null;
    placeholderCount = args.filter(function(x) {
        return (equals(x, ['keyword', '_'])) || (equals(x, ['spread', ['keyword', '_']]));
    }).length;
    /*@538:5*/
    hasSpread = args.some(function(x) {
        return x[0] === 'spread';
    });
    callsuper = (inOp(subject[0], ['.', '?.'])) && (equals(subject[1], ['keyword', 'super']));
    /*@541:5*/
    soak = type[0] === '?';
    if (callsuper) {
        subject = ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], subject[2]], ['identifier', 'call']];
        /*@545:9*/
        args.splice(1, 0, ['identifier', 'self']);
    };
    if (((placeholderCount === 0) && (!hasSpread)) && (!soak)) {
        return ((paren(subject) + '(') + args.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ')';
    };
    /*@550:5*/
    context = ['keyword', 'null'];
    if (inOp(subject[0], ['.', '?.'])) {
        context = ['identifier', register(getVarName('ref'))];
        /*@553:9*/
        subject[1] = ['=', context, subject[1]];
    };
    if (placeholderCount === 0) {
        if (!hasSpread) {
            /*@557:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'call']], (function() {
                    var r12, i16, l11, x7;
                    r12 = [];
                    r12.push('array');
                    r12.push(context);
                    l11 = enumerate(args.slice(1));
                    for (i16 = 0; i16 < l11.length; i16++) {
                        x7 = l11[i16];
                        r12.push(x7);
                    };
                    return r12;
                })()];
            };
        } else {
            var obj;
            /*@562:13*/
            obj = args;
            if (args.length === 2) {
                obj = args[1][1];
            };
            /*@565:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'apply']], ['array', context, obj]];
            };
        };
    } else {
        var temps;
        /*@570:9*/
        temps = (function() {
            var r13, start1, end1, step1, x8;
            r13 = [];
            start1 = 1;
            end1 = placeholderCount;
            step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
            for (x8 = start1; step1 > 0 ? x8 <= end1 : x8 >= end1; x8 += step1) {
                r13.push(getVarName('x'));
            };
            return r13;
        })();
        /*@572:9*/
        output = function(token) {
            var a, b;
            a = (function() {
                var r14, i17, l12, x9;
                r14 = [];
                r14.push('arraypattern');
                l12 = enumerate(temps.map(function(x) {
                    return [['identifier', x], null];
                }));
                for (i17 = 0; i17 < l12.length; i17++) {
                    x9 = l12[i17];
                    r14.push(x9);
                };
                return r14;
            })();
            /*@574:13*/
            b = args.slice(1).map(function(x) {
                if (equals(x, ['keyword', '_'])) {
                    var temp;
                    temp = temps.splice(0, 1)[0];
                    /*@577:21*/
                    return ['identifier', temp];
                } else if (equals(x, ['spread', ['keyword', '_']])) {
                    var temp;
                    temp = temps.splice(0, 1)[0];
                    /*@580:21*/
                    return ['spread', ['identifier', temp]];
                } else {
                    return x;
                };
            });
            /*@584:13*/
            return ['lambda', null, a, ['()', ['.', token, ['identifier', 'call']], (function() {
                var r15, i18, l13, x10;
                r15 = [];
                r15.push('array');
                r15.push(context);
                l13 = enumerate(b);
                for (i18 = 0; i18 < l13.length; i18++) {
                    x10 = l13[i18];
                    r15.push(x10);
                };
                return r15;
            })()]];
        };
    };
    /*@589:5*/
    if (soak) {
        var wrapper, token;
        (function(ref21) {
            wrapper = ref21[0];
            token = ref21[1];
            return ref21;
        })(getCheckExistenceWrapper(subject));
        /*@591:9*/
        return wrapper(output(token));
    };
    return expression(output(subject));
};
/*@597:1*/
// Block constructs
func = function(tree) {
    var identifier, args, s, isProperPattern, output, insert, code, vars;
    (function(ref22) {
        identifier = ref22[1];
        args = ref22[2];
        s = ref22[3];
        return ref22;
    })(tree);
    /*@599:5*/
    if (identifier != null) {
        identifier = register(expression(identifier));
    };
    isProperPattern = (!args.slice(1).every(function(x) {
        return x[0][0] === 'identifier';
    })) || args.slice(1).some(function(x) {
        return x[1] != null;
    });
    /*@605:5*/
    output = 'function(';
    if (identifier != null) {
        output = (identifier + ' = ') + output;
    };
    /*@609:5*/
    pushScope();
    if (!isProperPattern) {
        var vars, i19, l14, x;
        vars = args.slice(1).map(function(x) {
            return expression(x[0]);
        });
        /*@612:9*/
        l14 = enumerate(vars);
        for (i19 = 0; i19 < l14.length; i19++) {
            x = l14[i19];
            register(x);
        };
        /*@613:9*/
        output += vars.join(', ');
    };
    output += ') {';
    insert = [];
    /*@618:5*/
    if (isProperPattern) {
        var stemp, itemp;
        stemp = ['statements'];
        itemp = ['identifier', getVarName('i')];
        /*@622:9*/
        stemp.push(['=', args, ['keyword', 'arguments']]);
        insert.push(statements(stemp));
    };
    code = [output, [insert.join('\n'), statements(s)], '}'];
    /*@629:5*/
    vars = popScope();
    if (!isProperPattern) {
        vars = vars.filter(function(x) {
            return !args.slice(1).some(function() {
                var y;
                (function(ref23) {
                    (function(ref24) {
                        (function(ref25) {
                            y = ref25[1];
                            return ref25;
                        })(ref24[0]);
                        return ref24;
                    })(ref23[0]);
                    return ref23;
                })(arguments);
                return y === x;
            });
        });
    };
    /*@634:5*/
    code[1].splice(0, 0, varsDefinition(vars));
    return formatCode(code);
};
forStatement = function(tree) {
    var code, vars;
    /*@638:5*/
    code = [forHead(tree), [pushScope() + statements(tree[4])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@644:5*/
    return formatCode(code);
};
forHead = function(tree) {
    var first, second, subject, condition, s, identifierCount, output;
    /*@647:5*/
    (function(ref26) {
        (function(ref27) {
            first = ref27[0];
            second = ref27[1];
            return ref27;
        })(ref26[1]);
        subject = ref26[2];
        condition = ref26[3];
        s = ref26[4];
        return ref26;
    })(tree);
    /*@648:5*/
    identifierCount = (second != null) ? 2 : 1;
    output = '';
    if (first[1] === '_') {
        /*@652:9*/
        first = ['identifier', getVarName('x')];
    };
    if ((second != null) && (second[1] === '_')) {
        second = ['identifier', getVarName('y')];
    };
    /*@656:5*/
    if (subject[0] === 'range') {
        var start, next, end, starttemp, endtemp, steptemp, step;
        (function(ref28) {
            start = ref28[1];
            next = ref28[2];
            end = ref28[3];
            return ref28;
        })(subject);
        /*@659:9*/
        starttemp = ['identifier', getVarName('start')];
        endtemp = (end != null) ? ['identifier', getVarName('end')] : null;
        steptemp = ['identifier', getVarName('step')];
        /*@663:9*/
        step = ['number', 1];
        if (next != null) {
            step = ['-', next, starttemp];
        } else if (end != null) {
            /*@665:30*/
            step = ['?', ['==', endtemp, starttemp], ['number', 1], ['()', ['.', ['identifier', 'Math'], ['identifier', 'sign']], ['array', ['-', endtemp, starttemp]]]];
        };
        s = ['statements', ['=', starttemp, start]];
        if (end != null) {
            /*@676:25*/
            s.push(['=', endtemp, end]);
        };
        s.push(['=', steptemp, step]);
        if (second == null) {
            /*@680:13*/
            output = formatCode([statements(s), ((((((('for (' + statement(['=', first, starttemp])) + '; ') + (end ? ((((((((steptemp[1] + ' > 0 ? ') + expression(first)) + ' <= ') + endtemp[1]) + ' : ') + expression(first)) + ' >= ') + endtemp[1]) : 'true')) + '; ') + expression(first)) + ' += ') + steptemp[1]) + ') {']);
        } else {
            output = formatCode([statements(s), ((((((((('for (' + statement(['=', second, starttemp])) + ', ') + statement(['=', first, ['number', 0]])) + '; ') + (end ? ((((steptemp[1] + ' > 0 ? ') + expression(['<=', second, endtemp])) + ' : ') + expression('>=', second, endtemp)) : 'true')) + '; ') + expression(['+=', second, steptemp])) + ', ') + expression(['_++', first])) + ') {']);
        };
    } else if (identifierCount === 1) {
        var temp, listtemp, itemp;
        /*@694:9*/
        temp = ['identifier', addFlag('enumerate')];
        listtemp = getVarName('l');
        itemp = register(getVarName('i'));
        /*@698:9*/
        s = ['statements', ['=', ['identifier', listtemp], ['()', temp, ['array', subject]]]];
        output = formatCode([statements(s), ((((((('for (' + itemp) + ' = 0; ') + itemp) + ' < ') + listtemp) + '.length; ') + itemp) + '++) {', [statement(['=', first, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';']]);
    } else {
        var itemp, listtemp;
        /*@712:9*/
        itemp = register(getVarName('i'));
        listtemp = getVarName('l');
        s = ['statements', ['=', ['identifier', listtemp], subject]];
        /*@716:9*/
        output = formatCode([statements(s), ((('for (' + itemp) + ' in ') + listtemp) + ') {', [statement(['=', second, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';', statement(['=', first, ['()', ['identifier', 'parseInt'], ['array', ['identifier', itemp], ['number', 10]]]]) + ';', ((('if (isNaN(' + expression(first)) + ')) ') + statement(['=', first, ['identifier', itemp]])) + ';']]);
    };
    if (condition != null) {
        output += (((('\n' + exports.indent) + 'if (!(') + expression(condition)) + ')) continue;');
    };
    /*@735:5*/
    return output;
};
whileStatement = function(tree) {
    var condition, s, code, vars;
    /*@738:5*/
    (function(ref29) {
        condition = ref29[1];
        s = ref29[2];
        return ref29;
    })(tree);
    /*@740:5*/
    code = [('while (' + expression(condition)) + ') {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@746:5*/
    return formatCode(code);
};
ifStatement = function(tree) {
    var code, vars, output, i21, l15, condition, s, i;
    /*@749:5*/
    code = [('if (' + expression(tree[1][0])) + ') {', [pushScope() + statements(tree[1][1])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@755:5*/
    output = formatCode(code);
    l15 = tree;
    for (i21 in l15) {
        (function(ref30) {
            condition = ref30[0];
            s = ref30[1];
            return ref30;
        })(l15[i21]);
        i = parseInt(i21, 10);
        if (isNaN(i)) i = i21;
        if (!(i >= 2)) continue;
        /*@758:9*/
        code = [(condition === 'else') ? ' else {' : ((' else if (' + expression(condition)) + ') {'), [pushScope() + statements(s)], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@766:9*/
        output += formatCode(code);
    };
    return output;
};
/*@770:1*/
tryStatement = function(tree) {
    var s, catchblock, finallyblock, code, vars, output;
    (function(ref31) {
        s = ref31[1];
        catchblock = ref31[2];
        finallyblock = ref31[3];
        return ref31;
    })(tree);
    /*@773:5*/
    code = ['try {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@779:5*/
    output = formatCode(code);
    if (catchblock != null) {
        var temp;
        temp = getVarName('e');
        /*@784:9*/
        code = [(' catch (' + temp) + ') {', [pushScope(), (catchblock[0] != null) ? (expression(['=', catchblock[0], ['identifier', temp]]) + ';') : '', statements(catchblock[1])], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@792:9*/
        output += formatCode(code);
    } else {
        var temp;
        temp = getVarName('e');
        /*@795:9*/
        output += ((' catch(' + temp) + ') {}');
    };
    if (finallyblock != null) {
        code = [' finally {', [pushScope() + statements(tree[3])], '}'];
        /*@801:9*/
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        output += formatCode(code);
    };
    /*@806:5*/
    return output;
};

// Rewriter functions
chainCmp = function(tree) {
    var temps, s, i22, l16, x, i, expr, start2, end2, step2;
    /*@811:5*/
    temps = [];
    s = ['statements'];
    l16 = tree;
    for (i22 in l16) {
        x = l16[i22];
        i = parseInt(i22, 10);
        if (isNaN(i)) i = i22;
        if (!(modulo(i, 2) !== 0)) continue;
        var temp;
        /*@815:9*/
        temp = ['identifier', getVarName('r')];
        temps.push(temp);
        s.push(['=', temp, x]);
    };
    /*@819:5*/
    expr = temps[0];
    start2 = 3;
    end2 = tree.length - 1;
    step2 = 5 - start2;
    for (i = start2; step2 > 0 ? i <= end2 : i >= end2; i += step2) {
        /*@821:9*/
        if (i === 3) {
            expr = [tree[i - 1], expr, temps[((i + 1) / 2) - 1]];
        } else {
            expr = ['&&', expr, [tree[i - 1], temps[((i - 1) / 2) - 1], temps[((i + 1) / 2) - 1]]];
        };
    };
    /*@826:5*/
    s.push(['keyword', 'return', expr]);
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
range = function(tree) {
    var temp;
    /*@830:5*/
    temp = ['identifier', getVarName('i')];
    return array(['arrayfor', temp, ['for', [temp, null], tree, null]]);
};
lambda = function(tree) {
    var args, s;
    /*@834:5*/
    (function(ref32) {
        args = ref32[2];
        s = ref32[3];
        return ref32;
    })(tree);
    /*@836:5*/
    return func(['function', null, args, ['statements', ['keyword', 'return', s]]]);
};
existentialOp = function(tree) {
    var subject, defaultv, needTempVar, temp, condition;
    /*@842:5*/
    (function(ref33) {
        subject = ref33[1];
        defaultv = ref33[2];
        return ref33;
    })(tree);
    /*@844:5*/
    needTempVar = !inOp(subject[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : subject;
    condition = ['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]];
    /*@851:5*/
    if (needTempVar) {
        var s;
        s = ['statements'];
        s.push(['=', temp, subject]);
        /*@854:9*/
        s.push(['if', [condition, ['statements', ['keyword', 'return', defaultv]]]]);
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    /*@861:5*/
    return expression(['?', condition, defaultv, temp]);
};
patternMatch = function(tree) {
    var pattern, subject, temp, s;
    /*@864:5*/
    (function(ref34) {
        pattern = ref34[1];
        subject = ref34[2];
        return ref34;
    })(tree);
    /*@866:5*/
    temp = ['identifier', getVarName('ref')];
    s = (pattern[0] === 'arraypattern') ? arraypattern(pattern, temp) : objpattern(pattern, temp);
    s.push(['keyword', 'return', temp]);
    /*@870:5*/
    return formatCode([('(function(' + expression(temp)) + ') {', [statements(s)], ('})(' + expression(subject)) + ')']);
};
arraypattern = function(tree, ref) {
    var s, spreadindex, hasSpread, i23, l17, node, i, i24, l18;
    /*@877:5*/
    s = ['statements'];
    spreadindex = tree.map(function(x) {
        return x[0];
    }).indexOf('spread');
    /*@879:5*/
    hasSpread = spreadindex !== (-1);
    if (spreadindex < 0) {
        spreadindex = tree.length;
    };
    /*@882:5*/
    l17 = tree;
    for (i23 in l17) {
        node = l17[i23];
        i = parseInt(i23, 10);
        if (isNaN(i)) i = i23;
        if (!((function() {
        var r16, r17, r18;
        r16 = 1;
        r17 = i;
        r18 = spreadindex;
        return (r16 <= r17) && (r17 < r18);
    })())) continue;
        var isProperPattern, hasDefault, temp;
        /*@883:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@885:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['number', i - 1]]]];
        if (hasDefault) {
            /*@891:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@894:5*/
    if (hasSpread && (!equals(tree[spreadindex][1], ['keyword', '_']))) {
        var isProperPattern, hasDefault, temp;
        node = tree[spreadindex][1];
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        /*@897:9*/
        hasDefault = (!isProperPattern) && (node[1] != null);
        temp = null;
        if (spreadindex === (tree.length - 1)) {
            /*@901:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['.', ref, ['identifier', 'length']]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1]]]]];
        } else {
            var afterspreadcount;
            afterspreadcount = (tree.length - 1) - spreadindex;
            /*@915:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['-', ['.', ref, ['identifier', 'length']], ['number', afterspreadcount]]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1], ['-', ['number', afterspreadcount]]]]]];
        };
        if (hasDefault) {
            temp[2] = ['??', temp[2], node[1]];
        };
        /*@928:9*/
        s.push(temp);
    };
    l18 = tree;
    for (i24 in l18) {
        node = l18[i24];
        i = parseInt(i24, 10);
        if (isNaN(i)) i = i24;
        if (!(spreadindex < i)) continue;
        var isProperPattern, hasDefault, temp;
        /*@931:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@933:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['-', ['.', ref, ['identifier', 'length']], ['number', tree.length - i]]]]];
        if (hasDefault) {
            /*@942:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@945:5*/
    return s;
};
objpattern = function(tree, ref) {
    var s, i25, l19, key, node, i;
    /*@948:5*/
    s = ['statements'];
    l19 = tree;
    for (i25 in l19) {
        (function(ref35) {
            key = ref35[0];
            node = ref35[1];
            return ref35;
        })(l19[i25]);
        i = parseInt(i25, 10);
        if (isNaN(i)) i = i25;
        if (!(i >= 1)) continue;
        var isProperPattern, hasDefault, temp;
        /*@951:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@953:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], (key[0] === 'identifier') ? ['.', ref, key] : ['[]', ref, ['array', key]]];
        if (hasDefault) {
            /*@961:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@964:5*/
    return s;
};
classStatement = function(tree) {
    var classname, superclass, functions, constructor, s;
    /*@967:5*/
    (function(ref36) {
        classname = ref36[1];
        superclass = ref36[2];
        functions = ref36[3];
        return ref36;
    })(tree);
    /*@968:5*/
    if (superclass != null) {
        var temp;
        temp = ['identifier', addFlag('extend')];
    };
    /*@970:5*/
    functions = functions.filter(function(x) {
        return x[0] === 'function';
    }).map(function(f) {
        f[3].splice(1, 0, ['=', ['identifier', 'self'], ['keyword', 'this']]);
        /*@974:9*/
        return f;
    });
    constructor = functions.filter(function(x) {
        return x[1][1] === 'init';
    })[0];
    /*@979:5*/
    if (constructor == null) {
        constructor = ['function', ['identifier', 'init'], ['arraypattern'], ['statements']];
        if (superclass != null) {
            /*@983:13*/
            constructor[3].push(['=', ['identifier', 'self'], ['keyword', 'this']]);
            constructor[3].push(['()', ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], ['identifier', 'init']], ['identifier', 'apply']], ['array', ['identifier', 'self'], ['identifier', 'arguments']]]);
        };
    };
    /*@992:5*/
    s = ['statements'];
    s.push(constructor);
    if (superclass != null) {
        /*@995:28*/
        s.push(['()', temp, ['array', ['identifier', 'init'], superclass]]);
    };
    s = s.concat(functions.filter(function(f) {
        return f !== constructor;
    }).map(function(f) {
        var name;
        /*@1001:9*/
        (function(ref37) {
            name = ref37[0];
            f[1] = ref37[1];
            return ref37;
        })([f[1], null]);
        /*@1002:9*/
        return ['=', ['.', ['.', ['identifier', 'init'], ['identifier', 'prototype']], name], f];
    }));
    s.push(['keyword', 'return', ['identifier', 'init']]);
    return expression(['=', classname, ['()', ['function', null, ['arraypattern'], s], ['array']]]);
};
})();
