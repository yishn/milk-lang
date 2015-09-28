(function() {
var helperFunctions, pushScope, popScope, register, isObservable, getIdentifiers, getVarName, addFlag, formatCode, getCheckExistenceWrapper, paren, varsDefinition, statements, statement, deleteStatement, expression, assignment, dotOp, array, object, index, funcCall, func, forStatement, forHead, whileStatement, ifStatement, tryStatement, chainCmp, range, lambda, existentialOp, patternMatch, arraypattern, objpattern, classStatement;
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
exports.translate = function(tree, options) {
    var code, vars, output;
    if (options == null) {
        options = {
            indent: '    ',
            wrapper: true
        };
    };
    /*@7:5*/
    exports.indent = options.indent;
    exports.flags = {};
    exports.identifiers = getIdentifiers(tree);
    /*@10:5*/
    exports.currentScope = {
        vars: [],
        children: [],
        parent: null
    };
    /*@16:5*/
    code = statements(tree);
    vars = popScope();
    output = [varsDefinition(vars), helperFunctions(), code];
    /*@25:5*/
    if (options.wrapper) {
        output = (function() {
            var r1, i1, l, x1;
            r1 = [];
            r1.push('(function() {');
            l = enumerate(output);
            for (i1 = 0; i1 < l.length; i1++) {
                x1 = l[i1];
                r1.push(x1);
            };
            r1.push('})();');
            return r1;
        })();
    };
    /*@28:5*/
    return output.join('\n');
};
helperFunctions = function() {
    var output;
    /*@31:5*/
    output = [];
    if (exports.flags['modulo'] != null) {
        output.push(formatCode([exports.flags['modulo'] + ' = function(a, b) {', ['var c = a % b;', 'return c >= 0 ? c : c + b;'], '}']));
    };
    /*@41:5*/
    if (exports.flags['enumerate'] != null) {
        output.push(formatCode([exports.flags['enumerate'] + ' = function(l) {', ['var t = toString.call(l);', 'if (t !== "[object Array]" && t !== "[object String]")', ['return Object.keys(l);'], 'return l;'], '}']));
    };
    if (exports.flags['inOp'] != null) {
        /*@52:9*/
        output.push(formatCode([exports.flags['inOp'] + ' = function(x, l) {', ['var t = toString.call(l);', 'if (t !== "[object Array]" && t !== "[object String]")', ['return x in l;'], 'return l.indexOf(x) != -1;'], '}']));
    };
    if (exports.flags['compose'] != null) {
        output.push(formatCode([exports.flags['compose'] + ' = function(x, y) {', ['return function() {', ['if (arguments.length <= 1)', ['return x(y(arguments[0]));'], 'return x(y.apply(this, arguments));'], '}'], '}']));
    };
    /*@72:5*/
    if (exports.flags['extends'] != null) {
        output.push(formatCode([exports.flags['extends'] + ' = function(x, y) {', ['var copy = function() {}', 'copy.prototype = y.prototype;', 'var c = new copy();', 'c.constructor = x;', 'x.prototype = c;', 'x.prototype.__super__ = y.prototype;', 'x.prototype.__super__.init = y.prototype.constructor;', 'return x;'], '}']));
    };
    if (exports.flags['equals'] != null) {
        /*@87:9*/
        output.push(formatCode([exports.flags['equals'] + ' = function(a, b) {', ['if (a === b) return true;', 'if (a == null || b == null) return a == b;', 'var t = toString.call(a);', 'if (t !== toString.call(b)) return false;', 'var aa = t === "[object Array]";', 'var ao = t === "[object Object]";', 'if (aa) {', ['if (a.length !== b.length) return false;', 'for (var i = 0; i < a.length; i++)', [('if (!' + exports.flags['equals']) + '(a[i], b[i])) return false;'], 'return true;'], '} else if (ao) {', ['var kk = Object.keys(a);', 'if (kk.length !== Object.keys(b).length) return false;', 'for (var i = 0; i < kk.length; i++) {', ['k = kk[i];', 'if (!(k in b)) return false;', ('if (!' + exports.flags['equals']) + '(a[k], b[k])) return false;'], '}', 'return true;'], '}', 'return false;'], '}']));
    };
    return output.join('\n');
};
/*@118:1*/
// Scope functions
pushScope = function() {
    var scope;
    scope = {
        vars: [],
        children: [],
        parent: exports.currentScope
    };
    /*@125:5*/
    exports.currentScope.children.push(scope);
    exports.currentScope = scope;
    return '';
};
/*@129:1*/
popScope = function() {
    var scope;
    if (exports.currentScope == null) {
        return [];
    };
    /*@132:5*/
    scope = exports.currentScope;
    exports.currentScope = scope.parent;
    return scope.vars;
};
/*@136:1*/
register = function(varname) {
    if (!isObservable(varname)) {
        exports.currentScope.vars.push(varname);
    };
    /*@139:5*/
    return varname;
};
isObservable = function() {
    var varname, scope;
    (function(ref1) {
        varname = ref1[0];
        scope = (function() {
            var r2;
            r2 = ref1[1];
            if (((typeof r2) === 'undefined') || (r2 == null)) {
                return exports.currentScope;
            };
            return r2;
        })();
        return ref1;
    })(arguments);
    /*@142:5*/
    return (inOp(varname, scope.vars)) || ((scope.parent != null) && isObservable(varname, scope.parent));
};
getIdentifiers = function() {
    var tree, list, i4, l1, x;
    (function(ref2) {
        tree = ref2[0];
        list = (function() {
            var r3;
            r3 = ref2[1];
            if (((typeof r3) === 'undefined') || (r3 == null)) {
                return [];
            };
            return r3;
        })();
        return ref2;
    })(arguments);
    /*@147:5*/
    if ((tree[0] === 'identifier') && (!inOp(tree[1], list))) {
        list.push(tree[1]);
    };
    l1 = enumerate(tree);
    for (i4 = 0; i4 < l1.length; i4++) {
        x = l1[i4];
        if (!((x != null) && ((typeof x) === 'object'))) continue;
        /*@151:9*/
        getIdentifiers(x, list);
    };
    return list;
};
/*@155:1*/
getVarName = function(base) {
    var r, i;
    r = base;
    i = 0;
    /*@159:5*/
    while (inOp(r, exports.identifiers)) {
        r = base + (++i);
    };
    exports.identifiers.push(r);
    /*@163:5*/
    return r;
};

// Helper functions
addFlag = function(flag) {
    if (exports.flags[flag] == null) {
        var name;
        /*@169:9*/
        name = getVarName(flag);
        exports.flags[flag] = name;
        return name;
    };
    /*@174:5*/
    return exports.flags[flag];
};
formatCode = function(input) {
    var lineNotEmpty;
    /*@177:5*/
    lineNotEmpty = function(x) {
        return ((typeof x) === 'string') ? (x.trim() !== '') : (x != null);
    };
    return input.filter(lineNotEmpty).map(function(x) {
        return ((typeof x) === 'string') ? x : formatCode(x).split('\n').map(function(y) {
            return exports.indent + y;
        }).join('\n');
    }).join('\n');
};
/*@187:1*/
getCheckExistenceWrapper = function(token) {
    var needTempVar, temp, output;
    needTempVar = !inOp(token[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : token;
    /*@191:5*/
    output = function(tree) {
        var s;
        s = ['statements'];
        if (needTempVar) {
            /*@193:25*/
            s.push(['=', temp, token]);
        };
        s.push(['if', [['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]], ['statements', ['keyword', 'return', ['keyword', 'null']]]]]);
        s.push(['keyword', 'return', tree]);
        /*@203:9*/
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    return [output, temp];
};
/*@207:1*/
paren = function(tree) {
    var list;
    list = ['.', '?.', '()', '?()', '[]', '?[]', 'bool', 'number', 'keyword', 'identifier', 'array', 'object', 'string', '^', '%', '@', 'chaincmp', '??', 'range'];
    if (inOp(tree[0], list)) {
        /*@215:9*/
        return expression(tree);
    };
    return ('(' + expression(tree)) + ')';
};
/*@218:1*/
varsDefinition = function(vars) {
    if (vars.length !== 0) {
        return ('var ' + vars.join(', ')) + ';';
    };
    /*@221:5*/
    return '';
};

// Translator functions
statements = function(tree) {
    var s, i5, l2, node, i;
    /*@226:5*/
    s = [];
    l2 = tree;
    for (i5 in l2) {
        node = l2[i5];
        i = parseInt(i5, 10);
        if (isNaN(i)) i = i5;
        if (!(i >= 1)) continue;
        var code;
        /*@229:9*/
        code = statement(node);
        if (node.offset != null) {
            s.push('//OFFSET' + node.offset);
        };
        /*@233:9*/
        if (code != null) {
            s.push(code + ';');
        };
    };
    /*@236:5*/
    return formatCode(s);
};
statement = function(tree) {
    var type, name;
    /*@239:5*/
    (function(ref3) {
        type = ref3[0];
        name = ref3[1];
        return ref3;
    })(tree);
    /*@241:5*/
    if (type === 'keyword') {
        if (name === 'pass') {
            return '';
        };
        /*@243:9*/
        if (name === 'delete') {
            return deleteStatement(tree);
        };
        return tree[1] + (tree[2] ? (' ' + expression(tree[2])) : '');
    } else if (type === 'for') {
        /*@246:9*/
        return forStatement(tree);
    } else if (type === 'while') {
        return whileStatement(tree);
    } else if (type === 'if') {
        /*@250:9*/
        return ifStatement(tree);
    } else if (type === 'try') {
        return tryStatement(tree);
    } else if (type === 'class') {
        /*@254:9*/
        return classStatement(tree);
    } else {
        return expression(tree);
    };
};
/*@258:1*/
deleteStatement = function(tree) {
    var subject, temp, list;
    (function(ref4) {
        subject = ref4[2];
        return ref4;
    })(tree);
    /*@261:5*/
    if ((subject[0] !== '[]') || (subject[2].length === 2)) {
        return 'delete ' + expression(subject);
    };
    temp = ['identifier', getVarName('i')];
    /*@265:5*/
    list = subject[2];
    return forStatement(['for', [temp, null], list, null, ['statements', ['keyword', 'delete', ['[]', subject[1], ['array', temp]]]]]);
};
expression = function(tree) {
    var type, subject;
    /*@272:5*/
    (function(ref5) {
        type = ref5[0];
        subject = ref5[1];
        return ref5;
    })(tree);
    /*@274:5*/
    if (inOp(type, ['number', 'bool', 'keyword', 'identifier', 'regex', 'string'])) {
        return subject;
    } else if (inOp(type, ['array', 'arrayfor'])) {
        return array(tree);
    } else if (inOp(type, ['object', 'objectfor'])) {
        /*@279:9*/
        return object(tree);
    } else if (type === 'function') {
        return func(tree);
    } else if (type === '=') {
        /*@283:9*/
        return assignment(tree);
    } else if ((type === '==') || (type === '!=')) {
        var op;
        op = ((tree[2][0] === 'keyword') && (tree[2][1] === 'null')) ? type : (type + '=');
        /*@286:9*/
        return [paren(tree[1]), op, paren(tree[2])].join(' ');
    } else if ((type === 'equals') || (type === 'not equals')) {
        var temp, output;
        temp = ['identifier', addFlag('equals')];
        /*@289:9*/
        output = expression(['()', temp, (function() {
            var r4, i6, l3, x2;
            r4 = [];
            r4.push('array');
            l3 = enumerate(tree.slice(1, 2 + 1));
            for (i6 = 0; i6 < l3.length; i6++) {
                x2 = l3[i6];
                r4.push(x2);
            };
            return r4;
        })()]);
        /*@290:9*/
        return (type === 'equals') ? output : ('!' + output);
    } else if ((type.length === 2) && (type[1] === '=')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === 'lambda') {
        /*@294:9*/
        return lambda(tree);
    } else if (type === '?') {
        return [paren(tree[1]), '?', paren(tree[2]), ':', paren(tree[3])].join(' ');
    } else if (type === '??') {
        /*@298:9*/
        return existentialOp(tree);
    } else if ((type === '||') || (type === '&&')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '!') {
        /*@302:9*/
        return '!' + paren(subject);
    } else if (type === 'chaincmp') {
        return chainCmp(tree);
    } else if ((inOp(type, ['<', '>', '+', '-', '*', '/', 'instanceof'])) && (tree.length === 3)) {
        /*@306:9*/
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '%') {
        var temp;
        temp = ['identifier', addFlag('modulo')];
        /*@309:9*/
        return expression(['()', temp, (function() {
            var r5, i7, l4, x3;
            r5 = [];
            r5.push('array');
            l4 = enumerate(tree.slice(1, 2 + 1));
            for (i7 = 0; i7 < l4.length; i7++) {
                x3 = l4[i7];
                r5.push(x3);
            };
            return r5;
        })()]);
    } else if (type === '@') {
        var temp;
        /*@311:9*/
        temp = ['identifier', addFlag('compose')];
        return expression(['()', temp, (function() {
            var r6, i8, l5, x4;
            r6 = [];
            r6.push('array');
            l5 = enumerate(tree.slice(1, 2 + 1));
            for (i8 = 0; i8 < l5.length; i8++) {
                x4 = l5[i8];
                r6.push(x4);
            };
            return r6;
        })()]);
    } else if (type === '^') {
        /*@314:9*/
        return expression(['()', ['.', ['identifier', 'Math'], ['identifier', 'pow']], (function() {
            var r7, i9, l6, x5;
            r7 = [];
            r7.push('array');
            l6 = enumerate(tree.slice(1, 2 + 1));
            for (i9 = 0; i9 < l6.length; i9++) {
                x5 = l6[i9];
                r7.push(x5);
            };
            return r7;
        })()]);
    } else if ((type === 'in') || (type === 'not in')) {
        var temp, output;
        /*@319:9*/
        temp = ['identifier', addFlag('inOp')];
        output = expression(['()', temp, (function() {
            var r8, i10, l7, x6;
            r8 = [];
            r8.push('array');
            l7 = enumerate(tree.slice(1, 2 + 1));
            for (i10 = 0; i10 < l7.length; i10++) {
                x6 = l7[i10];
                r8.push(x6);
            };
            return r8;
        })()]);
        /*@321:9*/
        return (type === 'in') ? output : ('!' + output);
    } else if (inOp(type, ['+', '-', '++_', '--_', 'typeof', 'new'])) {
        var op;
        op = (inOp(type, ['new', 'typeof'])) ? (type + ' ') : type.replace('_', '');
        /*@324:9*/
        return op + paren(subject);
    } else if ((type === '_++') || (type === '_--')) {
        return paren(tree[1]) + type.slice(1);
    } else if (inOp(type, ['.', '?.'])) {
        /*@328:9*/
        return dotOp(tree);
    } else if (inOp(type, ['()', '?()'])) {
        return funcCall(tree);
    } else if (inOp(type, ['[]', '?[]'])) {
        /*@332:9*/
        return index(tree);
    } else if (type === 'range') {
        return range(tree);
    };
    /*@337:5*/
    // console.dir(tree, { depth: null })
    return '/*...*/';
};
assignment = function(tree) {
    var left, right, isProperPattern, assignProperArray, assignRange;
    /*@340:5*/
    (function(ref6) {
        left = ref6[1];
        right = ref6[2];
        return ref6;
    })(tree);
    /*@341:5*/
    isProperPattern = inOp(left[0], ['arraypattern', 'objpattern']);
    assignProperArray = ((!isProperPattern) && (left[0] === '[]')) && ((left[2].length > 2) || left[2].some(function(x) {
        return x[0] === 'spread';
    }));
    /*@344:5*/
    assignRange = assignProperArray && (left[2][0] === 'range');
    if (isProperPattern) {
        return patternMatch(tree);
    };
    /*@347:5*/
    if (equals(left, ['keyword', '_'])) {
        return null;
    };
    if (left[0] === 'identifier') {
        /*@348:33*/
        register(left[1]);
    };
    if (!assignProperArray) {
        return [paren(left), '=', expression(right)].join(' ');
    } else if (assignRange && (left[2][2] == null)) {
        var subject, rtemp, starttemp, lentemp;
        /*@353:9*/
        subject = left[2];
        rtemp = ['identifier', getVarName('r')];
        starttemp = ['identifier', getVarName('start')];
        /*@356:9*/
        lentemp = ['identifier', getVarName('len')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', starttemp, subject[1]], ['=', lentemp, (subject[3] != null) ? ['-', ['+', subject[3], ['number', 1]], starttemp] : ['.', rtemp, ['identifier', 'length']]], ['()', ['.', ['.', ['array'], ['identifier', 'splice']], ['identifier', 'apply']], ['array', rtemp, ['()', ['.', ['array', starttemp, lentemp], ['identifier', 'concat']], ['array', tree[2]]]]], ['keyword', 'return', rtemp]]], ['array']]);
    } else {
        var list, rtemp, listtemp, itemp, jtemp;
        /*@380:9*/
        list = left[2];
        rtemp = ['identifier', getVarName('r')];
        listtemp = ['identifier', getVarName('l')];
        /*@383:9*/
        itemp = ['identifier', getVarName('i')];
        jtemp = ['identifier', getVarName('j')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', listtemp, right], ['for', [itemp, jtemp], list, null, ['statements', ['=', ['[]', rtemp, ['array', jtemp]], ['[]', listtemp, ['array', itemp]]]]], ['keyword', 'return', listtemp]]], []]);
    };
};
/*@395:1*/
dotOp = function(tree) {
    var type, left, right;
    (function(ref7) {
        type = ref7[0];
        left = ref7[1];
        right = ref7[2];
        return ref7;
    })(tree);
    /*@398:5*/
    if (type[0] !== '?') {
        return [paren(left), '.', expression(right)].join('');
    } else {
        var wrapper, token;
        /*@401:9*/
        (function(ref8) {
            wrapper = ref8[0];
            token = ref8[1];
            return ref8;
        })(getCheckExistenceWrapper(left));
        /*@402:9*/
        return wrapper(['.', token, right]);
    };
};
array = function(tree) {
    var hasSpread, expr, fortrees, temp, s, ref, i12, l9, t, i;
    /*@405:5*/
    hasSpread = tree.some(function(x) {
        return x[0] === 'spread';
    });
    if ((tree[0] !== 'arrayfor') && (!hasSpread)) {
        /*@408:9*/
        return ('[' + tree.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ']';
    };
    if (hasSpread) {
        var temp, s, i11, l8, expr, i;
        /*@411:9*/
        temp = ['identifier', getVarName('r')];
        s = ['statements', ['=', temp, ['array']]];
        l8 = tree;
        for (i11 in l8) {
            expr = l8[i11];
            i = parseInt(i11, 10);
            if (isNaN(i)) i = i11;
            if (!(i >= 1)) continue;
            /*@415:13*/
            if (expr[0] !== 'spread') {
                s.push(['()', ['.', temp, ['identifier', 'push']], ['array', expr]]);
            } else {
                var xtemp;
                /*@418:17*/
                xtemp = ['identifier', getVarName('x')];
                s.push(['for', [xtemp, null], expr[1], null, ['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', xtemp]]]]);
            };
        };
        /*@423:9*/
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    (function(ref9) {
        expr = ref9[1];
        fortrees = (2 >= ref9.length) ? [] : [].slice.call(ref9, 2);
        return ref9;
    })(tree);
    /*@427:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['array']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@436:5*/
    l9 = fortrees;
    for (i12 in l9) {
        t = l9[i12];
        i = parseInt(i12, 10);
        if (isNaN(i)) i = i12;
        if (!(i >= 1)) continue;
        /*@437:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', expr]]]);
    /*@445:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
object = function(tree) {
    var key, value, fortrees, temp, s, ref, i14, l10, t, i;
    /*@448:5*/
    if (tree[0] !== 'objectfor') {
        if (tree.length === 1) {
            return '{}';
        };
        /*@450:9*/
        return formatCode(['{', tree.slice(1).map(function() {
            var x, y, i;
            (function(ref10) {
                (function(ref11) {
                    x = ref11[0];
                    y = ref11[1];
                    return ref11;
                })(ref10[0]);
                i = ref10[1];
                return ref10;
            })(arguments);
            return ((expression(x) + ': ') + expression(y)) + ((i === (tree.length - 2)) ? '' : ',');
        }), '}']);
    };
    /*@454:5*/
    (function(ref12) {
        (function(ref13) {
            key = ref13[0];
            value = ref13[1];
            return ref13;
        })(ref12[1]);
        fortrees = (2 >= ref12.length) ? [] : [].slice.call(ref12, 2);
        return ref12;
    })(tree);
    /*@455:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['object']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@464:5*/
    l10 = fortrees;
    for (i14 in l10) {
        t = l10[i14];
        i = parseInt(i14, 10);
        if (isNaN(i)) i = i14;
        if (!(i >= 1)) continue;
        /*@465:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['=', ['[]', temp, ['array', key]], value]]);
    /*@472:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
index = function(tree) {
    var type, left, right, output, soak, isProperArray, isRange;
    /*@475:5*/
    (function(ref14) {
        type = ref14[0];
        left = ref14[1];
        right = ref14[2];
        return ref14;
    })(tree);
    /*@476:5*/
    output = null;
    soak = type[0] === '?';
    isProperArray = right.length !== 2;
    /*@479:5*/
    isRange = right[0] === 'range';
    if ((!soak) && (!isProperArray)) {
        return ((paren(left) + '[') + expression(right[1])) + ']';
    };
    /*@484:5*/
    if (!isProperArray) {
        output = function(token) {
            return ['[]', token, right];
        };
    } else if (isRange && (right[2] == null)) {
        var start, end;
        /*@487:9*/
        (function(ref15) {
            start = ref15[1];
            end = ref15[3];
            return ref15;
        })(right);
        /*@489:9*/
        if (end == null) {
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start]];
            };
        } else {
            /*@495:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start, ['+', end, ['number', 1]]]];
            };
        };
    } else {
        var itemp;
        /*@500:9*/
        itemp = ['identifier', getVarName('i')];
        output = function(token) {
            return ['arrayfor', ['[]', token, ['array', itemp]], ['for', [itemp, null], right, null]];
        };
    };
    /*@506:5*/
    if (soak) {
        var wrapper, token;
        (function(ref16) {
            wrapper = ref16[0];
            token = ref16[1];
            return ref16;
        })(getCheckExistenceWrapper(left));
        /*@508:9*/
        return wrapper(output(token));
    };
    return expression(output(left));
};
/*@512:1*/
funcCall = function(tree) {
    var type, subject, args, output, placeholderCount, hasSpread, callsuper, soak;
    (function(ref17) {
        type = ref17[0];
        subject = ref17[1];
        args = ref17[2];
        return ref17;
    })(tree);
    /*@515:5*/
    output = null;
    placeholderCount = args.filter(function(x) {
        return (equals(x, ['keyword', '_'])) || (equals(x, ['spread', ['keyword', '_']]));
    }).length;
    /*@520:5*/
    hasSpread = args.some(function(x) {
        return x[0] === 'spread';
    });
    callsuper = (inOp(subject[0], ['.', '?.'])) && (equals(subject[1], ['keyword', 'super']));
    /*@523:5*/
    soak = type[0] === '?';
    if (callsuper) {
        tree[1] = ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], subject[2]], ['identifier', 'call']];
        /*@527:9*/
        tree[2].splice(1, 0, ['identifier', 'self']);
    };
    if (((placeholderCount === 0) && (!hasSpread)) && (!soak)) {
        return ((paren(subject) + '(') + args.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ')';
    };
    /*@532:5*/
    if (placeholderCount === 0) {
        if (!hasSpread) {
            output = function(token) {
                return ['()', token, args];
            };
        } else {
            var obj;
            /*@536:13*/
            obj = args;
            if (args.length === 2) {
                obj = args[1][1];
            };
            /*@538:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'apply']], ['array', ['keyword', 'this'], obj]];
            };
        };
    } else {
        var temps;
        /*@543:9*/
        temps = (function() {
            var r9, start1, end1, step1, x7;
            r9 = [];
            start1 = 1;
            end1 = placeholderCount;
            step1 = (end1 === start1) ? 1 : Math.sign(end1 - start1);
            for (x7 = start1; step1 > 0 ? x7 <= end1 : x7 >= end1; x7 += step1) {
                r9.push(getVarName('x'));
            };
            return r9;
        })();
        /*@545:9*/
        output = function(token) {
            var a, b;
            a = (function() {
                var r10, i15, l11, x8;
                r10 = [];
                r10.push('arraypattern');
                l11 = enumerate(temps.map(function(x) {
                    return [['identifier', x], null];
                }));
                for (i15 = 0; i15 < l11.length; i15++) {
                    x8 = l11[i15];
                    r10.push(x8);
                };
                return r10;
            })();
            /*@547:13*/
            b = args.map(function(x) {
                if (equals(x, ['keyword', '_'])) {
                    var temp;
                    temp = temps.splice(0, 1)[0];
                    /*@550:21*/
                    return ['identifier', temp];
                } else if (equals(x, ['spread', ['keyword', '_']])) {
                    var temp;
                    temp = temps.splice(0, 1)[0];
                    /*@553:21*/
                    return ['spread', ['identifier', temp]];
                } else {
                    return x;
                };
            });
            /*@557:13*/
            return ['lambda', null, a, ['()', token, b]];
        };
    };
    if (soak) {
        var wrapper, token;
        /*@560:9*/
        (function(ref18) {
            wrapper = ref18[0];
            token = ref18[1];
            return ref18;
        })(getCheckExistenceWrapper(subject));
        /*@561:9*/
        return wrapper(output(token));
    };
    return expression(output(subject));
};
/*@567:1*/
// Block constructs
func = function(tree) {
    var identifier, args, s, isProperPattern, output, insert, code, vars;
    (function(ref19) {
        identifier = ref19[1];
        args = ref19[2];
        s = ref19[3];
        return ref19;
    })(tree);
    /*@569:5*/
    if (identifier != null) {
        identifier = register(expression(identifier));
    };
    isProperPattern = (!args.slice(1).every(function(x) {
        return x[0][0] === 'identifier';
    })) || args.slice(1).some(function(x) {
        return x[1] != null;
    });
    /*@575:5*/
    output = 'function(';
    if (identifier != null) {
        output = (identifier + ' = ') + output;
    };
    /*@579:5*/
    pushScope();
    if (!isProperPattern) {
        var vars, i16, l12, x;
        vars = args.slice(1).map(function(x) {
            return expression(x[0]);
        });
        /*@582:9*/
        l12 = enumerate(vars);
        for (i16 = 0; i16 < l12.length; i16++) {
            x = l12[i16];
            register(x);
        };
        /*@583:9*/
        output += vars.join(', ');
    };
    output += ') {';
    insert = [];
    /*@588:5*/
    if (isProperPattern) {
        var stemp, itemp;
        stemp = ['statements'];
        itemp = ['identifier', getVarName('i')];
        /*@592:9*/
        stemp.push(['=', args, ['keyword', 'arguments']]);
        insert.push(statements(stemp));
    };
    code = [output, [insert.join('\n'), statements(s)], '}'];
    /*@599:5*/
    vars = popScope();
    if (!isProperPattern) {
        vars = vars.filter(function(x) {
            return !args.slice(1).some(function() {
                var y;
                (function(ref20) {
                    (function(ref21) {
                        (function(ref22) {
                            y = ref22[1];
                            return ref22;
                        })(ref21[0]);
                        return ref21;
                    })(ref20[0]);
                    return ref20;
                })(arguments);
                return y === x;
            });
        });
    };
    /*@604:5*/
    code[1].splice(0, 0, varsDefinition(vars));
    return formatCode(code);
};
forStatement = function(tree) {
    var code, vars;
    /*@608:5*/
    code = [forHead(tree), [pushScope() + statements(tree[4])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@614:5*/
    return formatCode(code);
};
forHead = function(tree) {
    var first, second, subject, condition, s, identifierCount, output;
    /*@617:5*/
    (function(ref23) {
        (function(ref24) {
            first = ref24[0];
            second = ref24[1];
            return ref24;
        })(ref23[1]);
        subject = ref23[2];
        condition = ref23[3];
        s = ref23[4];
        return ref23;
    })(tree);
    /*@618:5*/
    identifierCount = (second != null) ? 2 : 1;
    output = '';
    if (first[1] === '_') {
        /*@622:9*/
        first = ['identifier', getVarName('x')];
    };
    if ((second != null) && (second[1] === '_')) {
        second = ['identifier', getVarName('y')];
    };
    /*@626:5*/
    if (subject[0] === 'range') {
        var start, next, end, starttemp, endtemp, steptemp, step;
        (function(ref25) {
            start = ref25[1];
            next = ref25[2];
            end = ref25[3];
            return ref25;
        })(subject);
        /*@629:9*/
        starttemp = ['identifier', getVarName('start')];
        endtemp = (end != null) ? ['identifier', getVarName('end')] : null;
        steptemp = ['identifier', getVarName('step')];
        /*@633:9*/
        step = ['number', 1];
        if (next != null) {
            step = ['-', next, starttemp];
        } else if (end != null) {
            /*@635:30*/
            step = ['?', ['==', endtemp, starttemp], ['number', 1], ['()', ['.', ['identifier', 'Math'], ['identifier', 'sign']], ['array', ['-', endtemp, starttemp]]]];
        };
        s = ['statements', ['=', starttemp, start]];
        if (end != null) {
            /*@646:25*/
            s.push(['=', endtemp, end]);
        };
        s.push(['=', steptemp, step]);
        if (second == null) {
            /*@650:13*/
            output = formatCode([statements(s), ((((((('for (' + statement(['=', first, starttemp])) + '; ') + (end ? ((((((((steptemp[1] + ' > 0 ? ') + expression(first)) + ' <= ') + endtemp[1]) + ' : ') + expression(first)) + ' >= ') + endtemp[1]) : 'true')) + '; ') + expression(first)) + ' += ') + steptemp[1]) + ') {']);
        } else {
            output = formatCode([statements(s), ((((((((('for (' + statement(['=', second, starttemp])) + ', ') + statement(['=', first, ['number', 0]])) + '; ') + (end ? ((((steptemp[1] + ' > 0 ? ') + expression(['<=', second, endtemp])) + ' : ') + expression('>=', second, endtemp)) : 'true')) + '; ') + expression(['+=', second, steptemp])) + ', ') + expression(['_++', first])) + ') {']);
        };
    } else if (identifierCount === 1) {
        var temp, listtemp, itemp;
        /*@664:9*/
        temp = ['identifier', addFlag('enumerate')];
        listtemp = getVarName('l');
        itemp = register(getVarName('i'));
        /*@668:9*/
        s = ['statements', ['=', ['identifier', listtemp], ['()', temp, ['array', subject]]]];
        output = formatCode([statements(s), ((((((('for (' + itemp) + ' = 0; ') + itemp) + ' < ') + listtemp) + '.length; ') + itemp) + '++) {', [statement(['=', first, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';']]);
    } else {
        var itemp, listtemp;
        /*@682:9*/
        itemp = register(getVarName('i'));
        listtemp = getVarName('l');
        s = ['statements', ['=', ['identifier', listtemp], subject]];
        /*@686:9*/
        output = formatCode([statements(s), ((('for (' + itemp) + ' in ') + listtemp) + ') {', [statement(['=', second, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';', statement(['=', first, ['()', ['identifier', 'parseInt'], ['array', ['identifier', itemp], ['number', 10]]]]) + ';', ((('if (isNaN(' + expression(first)) + ')) ') + statement(['=', first, ['identifier', itemp]])) + ';']]);
    };
    if (condition != null) {
        output += (((('\n' + exports.indent) + 'if (!(') + expression(condition)) + ')) continue;');
    };
    /*@705:5*/
    return output;
};
whileStatement = function(tree) {
    var condition, s, code, vars;
    /*@708:5*/
    (function(ref26) {
        condition = ref26[1];
        s = ref26[2];
        return ref26;
    })(tree);
    /*@710:5*/
    code = [('while (' + expression(condition)) + ') {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@716:5*/
    return formatCode(code);
};
ifStatement = function(tree) {
    var code, vars, output, i18, l13, condition, s, i;
    /*@719:5*/
    code = [('if (' + expression(tree[1][0])) + ') {', [pushScope() + statements(tree[1][1])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@725:5*/
    output = formatCode(code);
    l13 = tree;
    for (i18 in l13) {
        (function(ref27) {
            condition = ref27[0];
            s = ref27[1];
            return ref27;
        })(l13[i18]);
        i = parseInt(i18, 10);
        if (isNaN(i)) i = i18;
        if (!(i >= 2)) continue;
        /*@728:9*/
        code = [(condition === 'else') ? ' else {' : ((' else if (' + expression(condition)) + ') {'), [pushScope() + statements(s)], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@736:9*/
        output += formatCode(code);
    };
    return output;
};
/*@740:1*/
tryStatement = function(tree) {
    var s, catchblock, finallyblock, code, vars, output;
    (function(ref28) {
        s = ref28[1];
        catchblock = ref28[2];
        finallyblock = ref28[3];
        return ref28;
    })(tree);
    /*@743:5*/
    code = ['try {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@749:5*/
    output = formatCode(code);
    if (catchblock != null) {
        code = [(' catch (' + expression(catchblock[0])) + ') {', [pushScope() + statements(catchblock[1])], '}'];
        /*@755:9*/
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        output += formatCode(code);
    } else {
        var temp;
        /*@760:9*/
        temp = getVarName('e');
        output += ((' catch(' + temp) + ') {}');
    };
    if (finallyblock != null) {
        /*@764:9*/
        code = [' finally {', [pushScope() + statements(tree[3])], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@770:9*/
        output += formatCode(code);
    };
    return output;
};
/*@776:1*/
// Rewriter functions
chainCmp = function(tree) {
    var temps, s, i19, l14, x, i, expr, start2, end2, step2;
    temps = [];
    s = ['statements'];
    /*@780:5*/
    l14 = tree;
    for (i19 in l14) {
        x = l14[i19];
        i = parseInt(i19, 10);
        if (isNaN(i)) i = i19;
        if (!(modulo(i, 2) !== 0)) continue;
        var temp;
        /*@781:9*/
        temp = ['identifier', getVarName('r')];
        temps.push(temp);
        s.push(['=', temp, x]);
    };
    /*@785:5*/
    expr = temps[0];
    start2 = 3;
    end2 = tree.length - 1;
    step2 = 5 - start2;
    for (i = start2; step2 > 0 ? i <= end2 : i >= end2; i += step2) {
        /*@787:9*/
        if (i === 3) {
            expr = [tree[i - 1], expr, temps[((i + 1) / 2) - 1]];
        } else {
            expr = ['&&', expr, [tree[i - 1], temps[((i - 1) / 2) - 1], temps[((i + 1) / 2) - 1]]];
        };
    };
    /*@792:5*/
    s.push(['keyword', 'return', expr]);
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
};
range = function(tree) {
    var temp;
    /*@796:5*/
    temp = ['identifier', getVarName('i')];
    return array(['arrayfor', temp, ['for', [temp, null], tree, null]]);
};
lambda = function(tree) {
    var args, s;
    /*@800:5*/
    (function(ref29) {
        args = ref29[2];
        s = ref29[3];
        return ref29;
    })(tree);
    /*@802:5*/
    return func(['function', null, args, ['statements', ['keyword', 'return', s]]]);
};
existentialOp = function(tree) {
    var subject, defaultv, needTempVar, temp, condition;
    /*@808:5*/
    (function(ref30) {
        subject = ref30[1];
        defaultv = ref30[2];
        return ref30;
    })(tree);
    /*@810:5*/
    needTempVar = !inOp(subject[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : subject;
    condition = ['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]];
    /*@817:5*/
    if (needTempVar) {
        var s;
        s = ['statements'];
        s.push(['=', temp, subject]);
        /*@820:9*/
        s.push(['if', [condition, ['statements', ['keyword', 'return', defaultv]]]]);
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
    };
    /*@827:5*/
    return expression(['?', condition, defaultv, temp]);
};
patternMatch = function(tree) {
    var pattern, subject, temp, s;
    /*@830:5*/
    (function(ref31) {
        pattern = ref31[1];
        subject = ref31[2];
        return ref31;
    })(tree);
    /*@832:5*/
    temp = ['identifier', getVarName('ref')];
    s = (pattern[0] === 'arraypattern') ? arraypattern(pattern, temp) : objpattern(pattern, temp);
    s.push(['keyword', 'return', temp]);
    /*@836:5*/
    return formatCode([('(function(' + expression(temp)) + ') {', [statements(s)], ('})(' + expression(subject)) + ')']);
};
arraypattern = function(tree, ref) {
    var s, spreadindex, hasSpread, i20, l15, node, i, i21, l16;
    /*@843:5*/
    s = ['statements'];
    spreadindex = tree.map(function(x) {
        return x[0];
    }).indexOf('spread');
    /*@845:5*/
    hasSpread = spreadindex !== (-1);
    if (spreadindex < 0) {
        spreadindex = tree.length;
    };
    /*@848:5*/
    l15 = tree;
    for (i20 in l15) {
        node = l15[i20];
        i = parseInt(i20, 10);
        if (isNaN(i)) i = i20;
        if (!((function() {
        var r11, r12, r13;
        r11 = 1;
        r12 = i;
        r13 = spreadindex;
        return (r11 <= r12) && (r12 < r13);
    })())) continue;
        var isProperPattern, hasDefault, temp;
        /*@849:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@851:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['number', i - 1]]]];
        if (hasDefault) {
            /*@857:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@860:5*/
    if (hasSpread && (!equals(tree[spreadindex][1], ['keyword', '_']))) {
        var isProperPattern, hasDefault, temp;
        node = tree[spreadindex][1];
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        /*@863:9*/
        hasDefault = (!isProperPattern) && (node[1] != null);
        temp = null;
        if (spreadindex === (tree.length - 1)) {
            /*@867:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['.', ref, ['identifier', 'length']]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1]]]]];
        } else {
            var afterspreadcount;
            afterspreadcount = (tree.length - 1) - spreadindex;
            /*@881:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['-', ['.', ref, ['identifier', 'length']], ['number', afterspreadcount]]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1], ['-', ['number', afterspreadcount]]]]]];
        };
        if (hasDefault) {
            temp[2] = ['??', temp[2], node[1]];
        };
        /*@894:9*/
        s.push(temp);
    };
    l16 = tree;
    for (i21 in l16) {
        node = l16[i21];
        i = parseInt(i21, 10);
        if (isNaN(i)) i = i21;
        if (!(spreadindex < i)) continue;
        var isProperPattern, hasDefault, temp;
        /*@897:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@899:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['-', ['.', ref, ['identifier', 'length']], ['number', tree.length - i]]]]];
        if (hasDefault) {
            /*@908:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@911:5*/
    return s;
};
objpattern = function(tree, ref) {
    var s, i22, l17, key, node, i;
    /*@914:5*/
    s = ['statements'];
    l17 = tree;
    for (i22 in l17) {
        (function(ref32) {
            key = ref32[0];
            node = ref32[1];
            return ref32;
        })(l17[i22]);
        i = parseInt(i22, 10);
        if (isNaN(i)) i = i22;
        if (!(i >= 1)) continue;
        var isProperPattern, hasDefault, temp;
        /*@917:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@919:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], (key[0] === 'identifier') ? ['.', ref, key] : ['[]', ref, ['array', key]]];
        if (hasDefault) {
            /*@927:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@930:5*/
    return s;
};
classStatement = function(tree) {
    var classname, superclass, functions, constructor, s;
    /*@933:5*/
    (function(ref33) {
        classname = ref33[1];
        superclass = ref33[2];
        functions = ref33[3];
        return ref33;
    })(tree);
    /*@934:5*/
    if (superclass != null) {
        var temp;
        temp = ['identifier', addFlag('extends')];
    };
    /*@936:5*/
    functions = functions.filter(function(x) {
        return x[0] === 'function';
    }).map(function(f) {
        f[3].splice(1, 0, ['=', ['identifier', 'self'], ['keyword', 'this']]);
        /*@940:9*/
        return f;
    });
    constructor = functions.filter(function(x) {
        return x[1][1] === 'init';
    })[0];
    /*@945:5*/
    if (constructor == null) {
        constructor = ['function', ['identifier', 'init'], ['arraypattern'], ['statements']];
        if (superclass != null) {
            /*@949:13*/
            constructor[3].push(['=', ['identifier', 'self'], ['keyword', 'this']]);
            constructor[3].push(['()', ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], ['identifier', 'init']], ['identifier', 'apply']], ['array', ['identifier', 'self'], ['identifier', 'arguments']]]);
        };
    };
    /*@958:5*/
    s = ['statements'];
    s.push(constructor);
    if (superclass != null) {
        /*@961:28*/
        s.push(['()', temp, ['array', ['identifier', 'init'], superclass]]);
    };
    s = s.concat(functions.filter(function(f) {
        return f !== constructor;
    }).map(function(f) {
        var name;
        /*@967:9*/
        (function(ref34) {
            name = ref34[0];
            f[1] = ref34[1];
            return ref34;
        })([f[1], null]);
        /*@968:9*/
        return ['=', ['.', ['.', ['identifier', 'init'], ['identifier', 'prototype']], name], f];
    }));
    s.push(['keyword', 'return', ['identifier', 'init']]);
    return expression(['=', classname, ['()', ['function', null, ['arraypattern'], s], ['array']]]);
};
})();
