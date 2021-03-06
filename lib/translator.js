(function() {
var helperFunctions, pushScope, popScope, register, isObservable, getIdentifiers, getVarName, unregister, addFlag, formatCode, getCheckExistenceWrapper, paren, varsDefinition, statements, statement, deleteStatement, expression, assignment, dotOp, composeOp, newOp, array, object, index, funcCall, func, forStatement, forHead, whileStatement, ifStatement, tryStatement, chainCmp, range, lambda, existentialOp, patternMatch, arraypattern, objpattern, classStatement;
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
    /*@4:5*/
    exports.indent = (function() {
        var r1;
        r1 = options.indent;
        if (((typeof r1) === 'undefined') || (r1 == null)) {
            return '    ';
        };
        return r1;
    })();
    /*@5:5*/
    exports.wrapper = (function() {
        var r1;
        r1 = options.wrapper;
        if (((typeof r1) === 'undefined') || (r1 == null)) {
            return true;
        };
        return r1;
    })();
    /*@7:5*/
    exports.flags = {};
    exports.identifiers = getIdentifiers(tree);
    exports.currentScope = {
        vars: [],
        children: [],
        parent: null
    };
    /*@15:5*/
    code = statements(tree);
    vars = popScope();
    output = [varsDefinition(vars), helperFunctions(), code];
    /*@24:5*/
    if (exports.wrapper) {
        output = (function() {
            var r1, i2, l, x1;
            r1 = [];
            r1.push('(function() {');
            l = enumerate(output);
            for (i2 = 0; i2 < l.length; i2++) {
                x1 = l[i2];
                r1.push(x1);
            };
            r1.push('})();');
            return r1;
        })();
    };
    /*@27:5*/
    return output.join('\n') + '\n';
};
helperFunctions = function() {
    var output;
    /*@30:5*/
    output = [];
    if (exports.flags['modulo'] != null) {
        output.push(formatCode([exports.flags['modulo'] + ' = function(a, b) {', ['var c = a % b;', 'return c >= 0 ? c : c + b;'], '}']));
    };
    /*@40:5*/
    if (exports.flags['sign'] != null) {
        output.push(formatCode([exports.flags['sign'] + ' = function(x) {', ['return x == 0 ? 0 : (x > 0 ? 1 : -1);'], '}']));
    };
    if (exports.flags['enumerate'] != null) {
        /*@48:9*/
        output.push(formatCode([exports.flags['enumerate'] + ' = function(l) {', ['var t = Object.prototype.toString.call(l);', 'if (t !== "[object Array]" && t !== "[object String]")', ['return Object.keys(l);'], 'return l;'], '}']));
    };
    if (exports.flags['inOp'] != null) {
        output.push(formatCode([exports.flags['inOp'] + ' = function(x, l) {', ['var t = Object.prototype.toString.call(l);', 'if (t !== "[object Array]" && t !== "[object String]")', ['return x in l;'], 'return l.indexOf(x) != -1;'], '}']));
    };
    /*@67:5*/
    if (exports.flags['compose'] != null) {
        output.push(formatCode([exports.flags['compose'] + ' = function(x, y, c1, c2) {', ['return function() {', ['return x.call(c1, y.apply(c2, arguments));'], '}'], '}']));
    };
    if (exports.flags['extend'] != null) {
        /*@77:9*/
        output.push(formatCode([exports.flags['extend'] + ' = function(x, y) {', ['var copy = function() {};', 'copy.prototype = y.prototype;', 'var c = new copy();', 'c.constructor = x;', 'x.prototype = c;', 'x.__super__ = y.prototype;', 'x.__super__.init = y.prototype.constructor;', 'return x;'], '}']));
    };
    if (exports.flags['newOp'] != null) {
        output.push(formatCode([exports.flags['newOp'] + ' = function(x, a) {', ['var copy = function() { return x.apply(this, a); };', 'copy.prototype = x.prototype;', 'return new copy()'], '}']));
    };
    /*@99:5*/
    if (exports.flags['equals'] != null) {
        output.push(formatCode([exports.flags['equals'] + ' = function(a, b) {', ['if (a === b) return true;', 'if (a == null || b == null) return a == b;', 'var t = Object.prototype.toString.call(a);', 'if (t !== Object.prototype.toString.call(b)) return false;', 'var aa = t === "[object Array]";', 'var ao = t === "[object Object]";', 'if (aa) {', ['if (a.length !== b.length) return false;', 'for (var i = 0; i < a.length; i++)', [('if (!' + exports.flags['equals']) + '(a[i], b[i])) return false;'], 'return true;'], '} else if (ao) {', ['var kk = Object.keys(a);', 'if (kk.length !== Object.keys(b).length) return false;', 'for (var i = 0; i < kk.length; i++) {', ['k = kk[i];', 'if (!(k in b)) return false;', ('if (!' + exports.flags['equals']) + '(a[k], b[k])) return false;'], '}', 'return true;'], '}', 'return false;'], '}']));
    };
    return output.join('\n');
};
/*@131:1*/
// Scope functions
pushScope = function() {
    var scope;
    scope = {
        vars: [],
        children: [],
        parent: exports.currentScope
    };
    /*@138:5*/
    exports.currentScope.children.push(scope);
    exports.currentScope = scope;
    return '';
};
/*@142:1*/
popScope = function() {
    var scope;
    if (exports.currentScope == null) {
        return [];
    };
    /*@145:5*/
    scope = exports.currentScope;
    exports.currentScope = scope.parent;
    return scope.vars;
};
/*@149:1*/
register = function(varname) {
    if (!isObservable(varname)) {
        exports.currentScope.vars.push(varname);
    };
    /*@152:5*/
    return varname;
};
isObservable = function() {
    var varname, scope;
    (function(r1) {
        varname = r1[0];
        scope = (function() {
            var r2;
            r2 = r1[1];
            if (((typeof r2) === 'undefined') || (r2 == null)) {
                return exports.currentScope;
            };
            return r2;
        })();
        return r1;
    })(arguments);
    /*@155:5*/
    return (inOp(varname, scope.vars)) || ((scope.parent != null) && isObservable(varname, scope.parent));
};
getIdentifiers = function() {
    var tree, list, i2, l, x;
    (function(r1) {
        tree = r1[0];
        list = (function() {
            var r2;
            r2 = r1[1];
            if (((typeof r2) === 'undefined') || (r2 == null)) {
                return [];
            };
            return r2;
        })();
        return r1;
    })(arguments);
    /*@160:5*/
    if ((tree[0] === 'identifier') && (!inOp(tree[1], list))) {
        list.push(tree[1]);
    };
    l = enumerate(tree);
    for (i2 = 0; i2 < l.length; i2++) {
        x = l[i2];
        if (!((x != null) && ((typeof x) === 'object'))) continue;
        /*@164:9*/
        getIdentifiers(x, list);
    };
    return list;
};
/*@168:1*/
getVarName = function(base) {
    var r, i;
    r = base;
    i = 0;
    /*@172:5*/
    while (inOp(r, exports.identifiers)) {
        r = base + (++i);
    };
    exports.identifiers.push(r);
    /*@176:5*/
    return r;
};
unregister = function() {
    var varnames;
    (function(r1) {
        varnames = (0 >= r1.length) ? [] : [].slice.call(r1, 0);
        return r1;
    })(arguments);
    /*@179:5*/
    exports.identifiers = exports.identifiers.filter(function(x) {
        return !inOp(x, varnames);
    });
    return '';
};
/*@184:1*/
// Helper functions
addFlag = function(flag) {
    if (exports.flags[flag] == null) {
        var name;
        name = getVarName(flag);
        /*@188:9*/
        exports.flags[flag] = name;
        return name;
    };
    return exports.flags[flag];
};
/*@193:1*/
formatCode = function(input) {
    var lineNotEmpty;
    lineNotEmpty = function(x) {
        return ((typeof x) === 'string') ? (x.trim() !== '') : (x != null);
    };
    /*@196:5*/
    return input.filter(lineNotEmpty).map(function(x) {
        return ((typeof x) === 'string') ? x : formatCode(x).split('\n').map(function(y) {
            return exports.indent + y;
        }).join('\n');
    }).join('\n');
};
/*@204:1*/
getCheckExistenceWrapper = function(token) {
    var needTempVar, temp, output;
    needTempVar = !inOp(token[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : token;
    /*@208:5*/
    output = function(tree) {
        var s, o;
        s = ['statements'];
        if (needTempVar) {
            /*@210:25*/
            s.push(['=', temp, token]);
        };
        s.push(['if', [['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]], ['statements', ['keyword', 'return', ['keyword', 'null']]]]]);
        s.push(['keyword', 'return', tree]);
        /*@220:9*/
        o = expression(['()', ['function', null, ['arraypattern'], s], ['array']]);
        if (needTempVar) {
            unregister(temp[1]);
        };
        /*@222:9*/
        return o;
    };
    return [output, temp];
};
/*@226:1*/
paren = function(tree) {
    var types, list, output;
    types = ['.', '?.', '()', '?()', '[]', '?[]', 'bool', 'number', 'keyword', 'identifier', 'array', 'object', 'string', '^', '%', '@', 'chaincmp', 'range'];
    list = ['function ', 'function('];
    /*@233:5*/
    output = expression(tree) + '';
    if ((inOp(tree[0], types)) && list.every(function(x) {
        return output.indexOf(x) !== 0;
    })) {
        /*@236:9*/
        return output;
    };
    return ('(' + output) + ')';
};
/*@239:1*/
varsDefinition = function(vars) {
    if (vars.length !== 0) {
        return ('var ' + vars.join(', ')) + ';';
    };
    /*@242:5*/
    return '';
};

// Translator functions
statements = function(tree) {
    var s, i1, l, node, i;
    /*@247:5*/
    s = [];
    l = tree;
    for (i1 in l) {
        node = l[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(i >= 1)) continue;
        var code;
        /*@250:9*/
        code = statement(node);
        if (node.offset != null) {
            s.push('//OFFSET' + node.offset);
        };
        /*@254:9*/
        if (code != null) {
            s.push(code + ';');
        };
    };
    /*@257:5*/
    return formatCode(s);
};
statement = function(tree) {
    var type, name;
    /*@260:5*/
    (function(r1) {
        type = r1[0];
        name = r1[1];
        return r1;
    })(tree);
    /*@262:5*/
    if (type === 'keyword') {
        if (name === 'pass') {
            return '';
        };
        /*@264:9*/
        if (name === 'delete') {
            return deleteStatement(tree);
        };
        return tree[1] + (tree[2] ? (' ' + expression(tree[2])) : '');
    } else if (type === 'for') {
        /*@267:9*/
        return forStatement(tree);
    } else if (type === 'while') {
        return whileStatement(tree);
    } else if (type === 'if') {
        /*@271:9*/
        return ifStatement(tree);
    } else if (type === 'try') {
        return tryStatement(tree);
    } else if (type === 'class') {
        /*@275:9*/
        return classStatement(tree);
    } else {
        return expression(tree);
    };
};
/*@279:1*/
deleteStatement = function(tree) {
    var subject, temp, list;
    (function(r1) {
        subject = r1[2];
        return r1;
    })(tree);
    /*@282:5*/
    if ((subject[0] !== '[]') || (subject[2].length === 2)) {
        return 'delete ' + expression(subject);
    };
    temp = ['identifier', getVarName('i')];
    /*@286:5*/
    list = subject[2];
    return forStatement(['for', [temp, null], list, null, ['statements', ['keyword', 'delete', ['[]', subject[1], ['array', temp]]]]]) + unregister(temp[1]);
};
expression = function(tree) {
    var type, subject;
    /*@293:5*/
    (function(r1) {
        type = r1[0];
        subject = r1[1];
        return r1;
    })(tree);
    /*@295:5*/
    if (inOp(type, ['number', 'bool', 'keyword', 'identifier', 'regex', 'string'])) {
        return subject;
    } else if (inOp(type, ['array', 'arrayfor'])) {
        return array(tree);
    } else if (inOp(type, ['object', 'objectfor'])) {
        /*@300:9*/
        return object(tree);
    } else if (type === 'function') {
        return func(tree);
    } else if (type === '=') {
        /*@304:9*/
        return assignment(tree);
    } else if ((type === '==') || (type === '!=')) {
        var op;
        op = ((tree[2][0] === 'keyword') && (tree[2][1] === 'null')) ? type : (type + '=');
        /*@307:9*/
        return [paren(tree[1]), op, paren(tree[2])].join(' ');
    } else if ((type === 'equals') || (type === 'not equals')) {
        var temp, output;
        temp = ['identifier', addFlag('equals')];
        /*@310:9*/
        output = expression(['()', temp, (function() {
            var r1, i1, l, x1;
            r1 = [];
            r1.push('array');
            l = enumerate(tree.slice(1, 2 + 1));
            for (i1 = 0; i1 < l.length; i1++) {
                x1 = l[i1];
                r1.push(x1);
            };
            return r1;
        })()]);
        /*@311:9*/
        return (type === 'equals') ? output : ('!' + output);
    } else if ((type.length === 2) && (type[1] === '=')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === 'lambda') {
        /*@315:9*/
        return lambda(tree);
    } else if (type === '?') {
        return [paren(tree[1]), '?', paren(tree[2]), ':', paren(tree[3])].join(' ');
    } else if (type === '??') {
        /*@319:9*/
        return existentialOp(tree);
    } else if ((type === '||') || (type === '&&')) {
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '!') {
        /*@323:9*/
        return '!' + paren(subject);
    } else if (type === 'chaincmp') {
        return chainCmp(tree);
    } else if ((inOp(type, ['<', '>', '+', '-', '*', '/', 'instanceof'])) && (tree.length === 3)) {
        /*@327:9*/
        return [paren(tree[1]), type, paren(tree[2])].join(' ');
    } else if (type === '%') {
        var temp;
        temp = ['identifier', addFlag('modulo')];
        /*@330:9*/
        return expression(['()', temp, (function() {
            var r1, i1, l, x1;
            r1 = [];
            r1.push('array');
            l = enumerate(tree.slice(1, 2 + 1));
            for (i1 = 0; i1 < l.length; i1++) {
                x1 = l[i1];
                r1.push(x1);
            };
            return r1;
        })()]);
    } else if (type === '@') {
        /*@332:9*/
        return composeOp(tree);
    } else if (type === '^') {
        return expression(['()', ['.', ['identifier', 'Math'], ['identifier', 'pow']], (function() {
            var r1, i1, l, x1;
            r1 = [];
            r1.push('array');
            l = enumerate(tree.slice(1, 2 + 1));
            for (i1 = 0; i1 < l.length; i1++) {
                x1 = l[i1];
                r1.push(x1);
            };
            return r1;
        })()]);
    } else if ((type === 'in') || (type === 'not in')) {
        var temp, output;
        /*@339:9*/
        temp = ['identifier', addFlag('inOp')];
        output = expression(['()', temp, (function() {
            var r1, i1, l, x1;
            r1 = [];
            r1.push('array');
            l = enumerate(tree.slice(1, 2 + 1));
            for (i1 = 0; i1 < l.length; i1++) {
                x1 = l[i1];
                r1.push(x1);
            };
            return r1;
        })()]);
        /*@341:9*/
        return (type === 'in') ? output : ('!' + output);
    } else if (inOp(type, ['+', '-', '++_', '--_', 'typeof'])) {
        var op;
        op = (type === 'typeof') ? (type + ' ') : type.replace('_', '');
        /*@344:9*/
        return op + paren(subject);
    } else if (type === 'new') {
        return newOp(tree);
    } else if ((type === '_++') || (type === '_--')) {
        /*@348:9*/
        return paren(tree[1]) + type.slice(1);
    } else if (inOp(type, ['.', '?.'])) {
        return dotOp(tree);
    } else if (inOp(type, ['()', '?()'])) {
        /*@352:9*/
        return funcCall(tree);
    } else if (inOp(type, ['[]', '?[]'])) {
        return index(tree);
    } else if (type === 'range') {
        /*@356:9*/
        return range(tree);
    };

    // console.dir(tree, { depth: null })
    return '/*...*/';
};
/*@361:1*/
assignment = function(tree) {
    var left, right, isProperPattern, assignProperArray, assignRange;
    (function(r1) {
        left = r1[1];
        right = r1[2];
        return r1;
    })(tree);
    /*@363:5*/
    isProperPattern = inOp(left[0], ['arraypattern', 'objpattern']);
    assignProperArray = ((!isProperPattern) && (left[0] === '[]')) && ((left[2].length > 2) || left[2].some(function(x) {
        return x[0] === 'spread';
    }));
    /*@366:5*/
    assignRange = assignProperArray && (left[2][0] === 'range');
    if (isProperPattern) {
        return patternMatch(tree);
    };
    /*@369:5*/
    if (equals(left, ['keyword', '_'])) {
        return null;
    };
    if (left[0] === 'identifier') {
        /*@370:33*/
        register(left[1]);
    };
    if (!assignProperArray) {
        return [paren(left), '=', expression(right)].join(' ');
    } else if (assignRange && (left[2][2] == null)) {
        var subject, rtemp, starttemp, lentemp;
        /*@375:9*/
        subject = left[2];
        rtemp = ['identifier', getVarName('r')];
        starttemp = ['identifier', getVarName('start')];
        /*@378:9*/
        lentemp = ['identifier', getVarName('len')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', starttemp, subject[1]], ['=', lentemp, (subject[3] != null) ? ['-', ['+', subject[3], ['number', 1]], starttemp] : ['.', rtemp, ['identifier', 'length']]], ['()', ['.', ['.', ['array'], ['identifier', 'splice']], ['identifier', 'apply']], ['array', rtemp, ['()', ['.', ['array', starttemp, lentemp], ['identifier', 'concat']], ['array', tree[2]]]]], ['keyword', 'return', rtemp]]], ['array']]) + unregister(rtemp[1], starttemp[1], lentemp[1]);
    } else {
        var list, rtemp, listtemp, itemp, jtemp;
        /*@402:9*/
        list = left[2];
        rtemp = ['identifier', getVarName('r')];
        listtemp = ['identifier', getVarName('l')];
        /*@405:9*/
        itemp = ['identifier', getVarName('i')];
        jtemp = ['identifier', getVarName('j')];
        return expression(['()', ['function', null, ['arraypattern'], ['statements', ['=', rtemp, left[1]], ['=', listtemp, right], ['for', [itemp, jtemp], list, null, ['statements', ['=', ['[]', rtemp, ['array', jtemp]], ['[]', listtemp, ['array', itemp]]]]], ['keyword', 'return', listtemp]]], []]) + unregister(rtemp[1], listtemp[1], itemp[1], jtemp[1]);
    };
};
/*@417:1*/
dotOp = function(tree) {
    var type, left, right;
    (function(r1) {
        type = r1[0];
        left = r1[1];
        right = r1[2];
        return r1;
    })(tree);
    /*@420:5*/
    if (type[0] !== '?') {
        return [paren(left), '.', expression(right)].join('');
    } else {
        var wrapper, token;
        /*@423:9*/
        (function(r1) {
            wrapper = r1[0];
            token = r1[1];
            return r1;
        })(getCheckExistenceWrapper(left));
        /*@424:9*/
        return wrapper(['.', token, right]);
    };
};
composeOp = function(tree) {
    var left, right, context1, context2, temp;
    /*@427:5*/
    (function(r1) {
        left = r1[1];
        right = r1[2];
        return r1;
    })(tree);
    /*@429:5*/
    context1 = ['keyword', 'null'];
    if (inOp(left[0], ['.', '?.', '[]', '?[]'])) {
        context1 = ['identifier', register(getVarName('r'))];
        /*@432:9*/
        left[1] = ['=', context1, left[1]];
    };
    context2 = ['keyword', 'null'];
    if (inOp(right[0], ['.', '?.', '[]', '?[]'])) {
        /*@436:9*/
        context2 = ['identifier', register(getVarName('r'))];
        right[1] = ['=', context2, right[1]];
    };
    temp = ['identifier', addFlag('compose')];
    /*@440:5*/
    return expression(['()', temp, ['array', left, right, context1, context2]]) + unregister(context1[1], context2[1]);
};
newOp = function(tree) {
    var isCall, subject, args, hasSpread, temp;
    /*@446:5*/
    isCall = tree[1][0] === '()';
    (function(r1) {
        (function(r2) {
            subject = r2[1];
            args = r2[2];
            return r2;
        })(r1[1]);
        return r1;
    })(tree);
    /*@449:5*/
    hasSpread = isCall && args.some(function(x) {
        return x[0] === 'spread';
    });
    if ((!isCall) || (!hasSpread)) {
        /*@450:31*/
        return 'new ' + paren(tree[1]);
    };
    temp = ['identifier', addFlag('newOp')];
    return expression(['()', temp, ['array', subject, args]]);
};
/*@455:1*/
array = function(tree) {
    var hasSpread, expr, fortrees, temp, s, ref, i1, l, t, i;
    hasSpread = tree.some(function(x) {
        return x[0] === 'spread';
    });
    /*@458:5*/
    if ((tree[0] !== 'arrayfor') && (!hasSpread)) {
        return ('[' + tree.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ']';
    };
    /*@461:5*/
    if (hasSpread) {
        var temp, s, i1, l, expr, i;
        temp = ['identifier', getVarName('r')];
        s = ['statements', ['=', temp, ['array']]];
        /*@465:9*/
        l = tree;
        for (i1 in l) {
            expr = l[i1];
            i = +i1;
            if (isNaN(i)) i = i1;
            if (!(i >= 1)) continue;
            /*@466:13*/
            if (expr[0] !== 'spread') {
                s.push(['()', ['.', temp, ['identifier', 'push']], ['array', expr]]);
            } else {
                var xtemp;
                /*@469:17*/
                xtemp = ['identifier', getVarName('x')];
                s.push(['for', [xtemp, null], expr[1], null, ['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', xtemp]]]]);
            };
        };
        /*@474:9*/
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]) + unregister(temp[1], (function() {
            if (((typeof xtemp) === 'undefined') || (xtemp == null)) {
                return null;
            };
            return xtemp[1];
        })());
    };
    /*@479:5*/
    (function(r1) {
        expr = r1[1];
        fortrees = (2 >= r1.length) ? [] : [].slice.call(r1, 2);
        return r1;
    })(tree);
    /*@480:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['array']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@489:5*/
    l = fortrees;
    for (i1 in l) {
        t = l[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(i >= 1)) continue;
        /*@490:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['()', ['.', temp, ['identifier', 'push']], ['array', expr]]]);
    /*@498:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]) + unregister(temp[1]);
};
object = function(tree) {
    var key, value, fortrees, temp, s, ref, i1, l, t, i;
    /*@501:5*/
    if (tree[0] !== 'objectfor') {
        if (tree.length === 1) {
            return '{}';
        };
        /*@503:9*/
        return formatCode(['{', tree.slice(1).map(function() {
            var x, y, i;
            (function(r1) {
                (function(r2) {
                    x = r2[0];
                    y = r2[1];
                    return r2;
                })(r1[0]);
                i = r1[1];
                return r1;
            })(arguments);
            return ((expression(x) + ': ') + expression(y)) + ((i === (tree.length - 2)) ? '' : ',');
        }), '}']);
    };
    /*@507:5*/
    (function(r1) {
        (function(r2) {
            key = r2[0];
            value = r2[1];
            return r2;
        })(r1[1]);
        fortrees = (2 >= r1.length) ? [] : [].slice.call(r1, 2);
        return r1;
    })(tree);
    /*@508:5*/
    temp = ['identifier', getVarName('r')];
    s = ['statements', ['=', temp, ['object']], fortrees[0], ['keyword', 'return', temp]];
    ref = s[2];
    /*@517:5*/
    l = fortrees;
    for (i1 in l) {
        t = l[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(i >= 1)) continue;
        /*@518:9*/
        ref.push(['statements', t]);
        ref = fortrees[i];
    };
    ref.push(['statements', ['=', ['[]', temp, ['array', key]], value]]);
    /*@525:5*/
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]) + unregister(temp[1]);
};
index = function(tree) {
    var type, left, right, output, soak, isProperArray, isRange;
    /*@528:5*/
    (function(r1) {
        type = r1[0];
        left = r1[1];
        right = r1[2];
        return r1;
    })(tree);
    /*@529:5*/
    output = null;
    soak = type[0] === '?';
    isProperArray = right.length !== 2;
    /*@532:5*/
    isRange = right[0] === 'range';
    if ((!soak) && (!isProperArray)) {
        return ((paren(left) + '[') + expression(right[1])) + ']';
    };
    /*@537:5*/
    if (!isProperArray) {
        output = function(token) {
            return ['[]', token, right];
        };
    } else if (isRange && (right[2] == null)) {
        var start, end;
        /*@540:9*/
        (function(r1) {
            start = r1[1];
            end = r1[3];
            return r1;
        })(right);
        /*@542:9*/
        if (end == null) {
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start]];
            };
        } else {
            /*@548:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'slice']], ['array', start, ['+', end, ['number', 1]]]];
            };
        };
    } else {
        var itemp;
        /*@553:9*/
        itemp = ['identifier', getVarName('i')];
        output = function(token) {
            return ['arrayfor', ['[]', token, ['array', itemp]], ['for', [itemp, null], right, null]];
        };
    };
    /*@559:5*/
    if (soak) {
        var wrapper, token;
        (function(r1) {
            wrapper = r1[0];
            token = r1[1];
            return r1;
        })(getCheckExistenceWrapper(left));
        /*@561:9*/
        return wrapper(output(token)) + unregister((function() {
            if (((typeof itemp) === 'undefined') || (itemp == null)) {
                return null;
            };
            return itemp[1];
        })());
    };
    /*@563:5*/
    return expression(output(left)) + unregister((function() {
        if (((typeof itemp) === 'undefined') || (itemp == null)) {
            return null;
        };
        return itemp[1];
    })());
};
/*@565:1*/
funcCall = function(tree) {
    var type, subject, args, output, placeholderCount, temps, hasSpread, callsuper, soak, context;
    (function(r1) {
        type = r1[0];
        subject = r1[1];
        args = r1[2];
        return r1;
    })(tree);
    /*@567:5*/
    output = null;
    placeholderCount = args.filter(function(x) {
        return (equals(x, ['keyword', '_'])) || (equals(x, ['spread', ['keyword', '_']]));
    }).length;
    /*@573:5*/
    temps = [];
    hasSpread = args.some(function(x) {
        return x[0] === 'spread';
    });
    /*@576:5*/
    callsuper = (inOp(subject[0], ['.', '?.'])) && (equals(subject[1], ['keyword', 'super']));
    soak = type[0] === '?';
    if (callsuper) {
        /*@581:9*/
        subject = ['.', ['.', ['.', ['identifier', exports.currentClassName], ['identifier', '__super__']], subject[2]], ['identifier', 'call']];
        args.splice(1, 0, ['identifier', 'self']);
    };
    if (((placeholderCount === 0) && (!hasSpread)) && (!soak)) {
        /*@589:9*/
        return ((paren(subject) + '(') + args.slice(1).map(function(x) {
            return expression(x);
        }).join(', ')) + ')';
    };
    context = ['keyword', 'null'];
    /*@592:5*/
    if (inOp(subject[0], ['.', '?.', '[]', '?[]'])) {
        context = ['identifier', register(getVarName('r'))];
        subject[1] = ['=', context, subject[1]];
    };
    /*@596:5*/
    if (placeholderCount === 0) {
        if (!hasSpread) {
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'call']], (function() {
                    var r1, i1, l, x1;
                    r1 = [];
                    r1.push('array');
                    r1.push(context);
                    l = enumerate(args.slice(1));
                    for (i1 = 0; i1 < l.length; i1++) {
                        x1 = l[i1];
                        r1.push(x1);
                    };
                    return r1;
                })()];
            };
        } else {
            var obj;
            /*@603:13*/
            obj = args;
            if (args.length === 2) {
                obj = args[1][1];
            };
            /*@606:13*/
            output = function(token) {
                return ['()', ['.', token, ['identifier', 'apply']], ['array', context, obj]];
            };
        };
    } else {
        /*@611:9*/
        temps = (function() {
            var r1, start1, end1, step1, x1;
            r1 = [];
            start1 = 1;
            end1 = placeholderCount;
            step1 = (end1 === start1) ? 1 : sign(end1 - start1);
            for (x1 = start1; step1 > 0 ? x1 <= end1 : x1 >= end1; x1 += step1) {
                r1.push(getVarName('x'));
            };
            return r1;
        })();
        /*@613:9*/
        output = function(token) {
            var a, i, b;
            a = (function() {
                var r1, i1, l, x1;
                r1 = [];
                r1.push('arraypattern');
                l = enumerate(temps.map(function(x) {
                    return [['identifier', x], null];
                }));
                for (i1 = 0; i1 < l.length; i1++) {
                    x1 = l[i1];
                    r1.push(x1);
                };
                return r1;
            })();
            /*@615:13*/
            i = 0;
            b = args.slice(1).map(function(x) {
                if (equals(x, ['keyword', '_'])) {
                    /*@618:21*/
                    return ['identifier', temps[i++]];
                } else if (equals(x, ['spread', ['keyword', '_']])) {
                    return ['spread', ['identifier', temps[i++]]];
                } else {
                    /*@622:21*/
                    return x;
                };
            });
            return ['lambda', null, a, ['()', ['.', token, ['identifier', 'call']], (function() {
                var r1, i1, l, x1;
                r1 = [];
                r1.push('array');
                r1.push(context);
                l = enumerate(b);
                for (i1 = 0; i1 < l.length; i1++) {
                    x1 = l[i1];
                    r1.push(x1);
                };
                return r1;
            })()]];
        };
    };
    /*@629:5*/
    if (soak) {
        var wrapper, token;
        (function(r1) {
            wrapper = r1[0];
            token = r1[1];
            return r1;
        })(getCheckExistenceWrapper(subject));
        /*@631:9*/
        return wrapper(output(token)) + unregister.apply(null, (function() {
            var r1, i1, l, x1;
            r1 = [];
            r1.push(context[1]);
            l = enumerate(temps);
            for (i1 = 0; i1 < l.length; i1++) {
                x1 = l[i1];
                r1.push(x1);
            };
            return r1;
        })());
    };
    /*@633:5*/
    return expression(output(subject)) + unregister.apply(null, (function() {
        var r1, i1, l, x1;
        r1 = [];
        r1.push(context[1]);
        l = enumerate(temps);
        for (i1 = 0; i1 < l.length; i1++) {
            x1 = l[i1];
            r1.push(x1);
        };
        return r1;
    })());
};
/*@637:1*/
// Block constructs
func = function(tree) {
    var identifier, args, s, isProperPattern, output, insert, code, vars;
    (function(r1) {
        identifier = r1[1];
        args = r1[2];
        s = r1[3];
        return r1;
    })(tree);
    /*@639:5*/
    if (identifier != null) {
        identifier = register(expression(identifier));
    };
    isProperPattern = (!args.slice(1).every(function(x) {
        return x[0][0] === 'identifier';
    })) || args.slice(1).some(function(x) {
        return x[1] != null;
    });
    /*@645:5*/
    output = 'function(';
    if (identifier != null) {
        output = (identifier + ' = ') + output;
    };
    /*@649:5*/
    pushScope();
    if (!isProperPattern) {
        var vars, i1, l, x;
        vars = args.slice(1).map(function(x) {
            return expression(x[0]);
        });
        /*@652:9*/
        l = enumerate(vars);
        for (i1 = 0; i1 < l.length; i1++) {
            x = l[i1];
            register(x);
        };
        /*@653:9*/
        output += vars.join(', ');
    };
    output += ') {';
    insert = [];
    /*@658:5*/
    if (isProperPattern) {
        var stemp, itemp;
        stemp = ['statements'];
        itemp = ['identifier', getVarName('i')];
        /*@662:9*/
        stemp.push(['=', args, ['keyword', 'arguments']]);
        insert.push(statements(stemp));
    };
    code = [output, [insert.join('\n'), statements(s)], '}'];
    /*@669:5*/
    vars = popScope();
    if (!isProperPattern) {
        vars = vars.filter(function(x) {
            return !args.slice(1).some(function() {
                var y;
                (function(r1) {
                    (function(r2) {
                        (function(r3) {
                            y = r3[1];
                            return r3;
                        })(r2[0]);
                        return r2;
                    })(r1[0]);
                    return r1;
                })(arguments);
                return y === x;
            });
        });
    };
    /*@674:5*/
    code[1].splice(0, 0, varsDefinition(vars));
    return formatCode(code) + unregister((function() {
        if (((typeof itemp) === 'undefined') || (itemp == null)) {
            return null;
        };
        return itemp[1];
    })());
};
/*@677:1*/
forStatement = function(tree) {
    var head, temps, code, vars;
    (function(r1) {
        head = r1[0];
        temps = r1[1];
        return r1;
    })(forHead(tree));
    /*@679:5*/
    code = [head, [pushScope() + statements(tree[4])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@685:5*/
    return formatCode(code) + unregister.apply(null, temps);
};
forHead = function(tree) {
    var first, second, subject, condition, s, identifierCount, output, temps;
    /*@688:5*/
    (function(r1) {
        (function(r2) {
            first = r2[0];
            second = r2[1];
            return r2;
        })(r1[1]);
        subject = r1[2];
        condition = r1[3];
        s = r1[4];
        return r1;
    })(tree);
    /*@689:5*/
    identifierCount = (second != null) ? 2 : 1;
    output = '';
    temps = [];
    /*@693:5*/
    if (first[1] === '_') {
        first = ['identifier', getVarName('x')];
        temps.push(first[1]);
    };
    /*@696:5*/
    if ((second != null) && (second[1] === '_')) {
        second = ['identifier', getVarName('y')];
        temps.push(second[1]);
    };
    /*@700:5*/
    if (subject[0] === 'range') {
        var start, next, end, starttemp, endtemp, steptemp, temp, step;
        (function(r1) {
            start = r1[1];
            next = r1[2];
            end = r1[3];
            return r1;
        })(subject);
        /*@703:9*/
        starttemp = ['identifier', getVarName('start')];
        endtemp = (end != null) ? ['identifier', getVarName('end')] : null;
        steptemp = ['identifier', getVarName('step')];
        /*@706:9*/
        temp = ['identifier', addFlag('sign')];
        step = ['number', 1];
        if (next != null) {
            /*@709:26*/
            step = ['-', next, starttemp];
        } else if (end != null) {
            step = ['?', ['==', endtemp, starttemp], ['number', 1], ['()', temp, ['array', ['-', endtemp, starttemp]]]];
        };
        /*@716:9*/
        s = ['statements', ['=', starttemp, start]];
        if (end != null) {
            s.push(['=', endtemp, end]);
        };
        /*@718:9*/
        s.push(['=', steptemp, step]);
        if (second == null) {
            output = formatCode([statements(s), ((((((('for (' + statement(['=', first, starttemp])) + '; ') + (end ? ((((((((steptemp[1] + ' > 0 ? ') + expression(first)) + ' <= ') + endtemp[1]) + ' : ') + expression(first)) + ' >= ') + endtemp[1]) : 'true')) + '; ') + expression(first)) + ' += ') + steptemp[1]) + ') {']);
        } else {
            /*@728:13*/
            output = formatCode([statements(s), ((((((((('for (' + statement(['=', second, starttemp])) + ', ') + statement(['=', first, ['number', 0]])) + '; ') + (end ? ((((steptemp[1] + ' > 0 ? ') + expression(['<=', second, endtemp])) + ' : ') + expression(['>=', second, endtemp])) : 'true')) + '; ') + expression(['+=', second, steptemp])) + ', ') + expression(['_++', first])) + ') {']);
        };
        temps.push(starttemp[1], (function() {
            if (((typeof endtemp) === 'undefined') || (endtemp == null)) {
                return null;
            };
            return endtemp[1];
        })(), steptemp[1]);
    } else if (identifierCount === 1) {
        var temp, listtemp, itemp;
        /*@737:9*/
        temp = ['identifier', addFlag('enumerate')];
        listtemp = getVarName('l');
        itemp = register(getVarName('i'));
        /*@741:9*/
        s = ['statements', ['=', ['identifier', listtemp], ['()', temp, ['array', subject]]]];
        output = formatCode([statements(s), ((((((('for (' + itemp) + ' = 0; ') + itemp) + ' < ') + listtemp) + '.length; ') + itemp) + '++) {', [statement(['=', first, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';']]);
        temps.push(listtemp, itemp);
    } else {
        var itemp, listtemp;
        /*@757:9*/
        itemp = register(getVarName('i'));
        listtemp = getVarName('l');
        s = ['statements', ['=', ['identifier', listtemp], subject]];
        /*@761:9*/
        output = formatCode([statements(s), ((('for (' + itemp) + ' in ') + listtemp) + ') {', [statement(['=', second, ['[]', ['identifier', listtemp], ['array', ['identifier', itemp]]]]) + ';', statement(['=', first, ['+', ['identifier', itemp]]]) + ';', ((('if (isNaN(' + expression(first)) + ')) ') + statement(['=', first, ['identifier', itemp]])) + ';']]);
        temps.push(listtemp, itemp);
    };
    if (condition != null) {
        /*@779:9*/
        output += (((('\n' + exports.indent) + 'if (!(') + expression(condition)) + ')) continue;');
    };
    return [output, temps];
};
/*@784:1*/
whileStatement = function(tree) {
    var condition, s, code, vars;
    (function(r1) {
        condition = r1[1];
        s = r1[2];
        return r1;
    })(tree);
    /*@787:5*/
    code = [('while (' + expression(condition)) + ') {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@793:5*/
    return formatCode(code);
};
ifStatement = function(tree) {
    var code, vars, output, i1, l, condition, s, i;
    /*@796:5*/
    code = [('if (' + expression(tree[1][0])) + ') {', [pushScope() + statements(tree[1][1])], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@802:5*/
    output = formatCode(code);
    l = tree;
    for (i1 in l) {
        (function(r1) {
            condition = r1[0];
            s = r1[1];
            return r1;
        })(l[i1]);
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(i >= 2)) continue;
        /*@805:9*/
        code = [(condition === 'else') ? ' else {' : ((' else if (' + expression(condition)) + ') {'), [pushScope() + statements(s)], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@813:9*/
        output += formatCode(code);
    };
    return output;
};
/*@817:1*/
tryStatement = function(tree) {
    var s, catchblock, finallyblock, code, vars, output, temp;
    (function(r1) {
        s = r1[1];
        catchblock = r1[2];
        finallyblock = r1[3];
        return r1;
    })(tree);
    /*@820:5*/
    code = ['try {', [pushScope() + statements(s)], '}'];
    vars = popScope();
    code[1].splice(0, 0, varsDefinition(vars));
    /*@826:5*/
    output = formatCode(code);
    temp = getVarName('e');
    if (catchblock != null) {
        /*@831:9*/
        code = [(' catch (' + temp) + ') {', [pushScope(), (catchblock[0] != null) ? (expression(['=', catchblock[0], ['identifier', temp]]) + ';') : '', statements(catchblock[1])], '}'];
        vars = popScope();
        code[1].splice(0, 0, varsDefinition(vars));
        /*@839:9*/
        output += formatCode(code);
    } else {
        output += ((' catch(' + temp) + ') {}');
    };
    /*@843:5*/
    if (finallyblock != null) {
        code = [' finally {', [pushScope() + statements(tree[3])], '}'];
        vars = popScope();
        /*@849:9*/
        code[1].splice(0, 0, varsDefinition(vars));
        output += formatCode(code);
    };
    return output + unregister(temp);
};
/*@856:1*/
// Rewriter functions
chainCmp = function(tree) {
    var temps, s, i1, l, x, i, expr, start1, end1, step1;
    temps = [];
    s = ['statements'];
    /*@860:5*/
    l = tree;
    for (i1 in l) {
        x = l[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(modulo(i, 2) !== 0)) continue;
        var temp;
        /*@861:9*/
        temp = ['identifier', getVarName('r')];
        temps.push(temp);
        s.push(['=', temp, x]);
    };
    /*@865:5*/
    expr = temps[0];
    start1 = 3;
    end1 = tree.length - 1;
    step1 = 5 - start1;
    for (i = start1; step1 > 0 ? i <= end1 : i >= end1; i += step1) {
        /*@867:9*/
        if (i === 3) {
            expr = [tree[i - 1], expr, temps[((i + 1) / 2) - 1]];
        } else {
            expr = ['&&', expr, [tree[i - 1], temps[((i - 1) / 2) - 1], temps[((i + 1) / 2) - 1]]];
        };
    };
    /*@872:5*/
    s.push(['keyword', 'return', expr]);
    return expression(['()', ['function', null, ['arraypattern'], s], ['array']]) + unregister(temps.map(function(x) {
        return x[1];
    }));
};
/*@878:1*/
range = function(tree) {
    var temp;
    temp = ['identifier', getVarName('i')];
    return array(['arrayfor', temp, ['for', [temp, null], tree, null]]) + unregister(temp[1]);
};
/*@882:1*/
lambda = function(tree) {
    var args, s;
    (function(r1) {
        args = r1[2];
        s = r1[3];
        return r1;
    })(tree);
    /*@885:5*/
    return func(['function', null, args, ['statements', ['keyword', 'return', s]]]);
};
existentialOp = function(tree) {
    var subject, defaultv, needTempVar, temp, condition;
    /*@891:5*/
    (function(r1) {
        subject = r1[1];
        defaultv = r1[2];
        return r1;
    })(tree);
    /*@893:5*/
    needTempVar = !inOp(subject[0], ['identifier', 'keyword']);
    temp = needTempVar ? ['identifier', getVarName('r')] : subject;
    condition = ['||', ['==', ['typeof', temp], ['string', "'undefined'"]], ['==', temp, ['keyword', 'null']]];
    /*@900:5*/
    if (needTempVar) {
        var s;
        s = ['statements'];
        s.push(['=', temp, subject]);
        /*@903:9*/
        s.push(['if', [condition, ['statements', ['keyword', 'return', defaultv]]]]);
        s.push(['keyword', 'return', temp]);
        return expression(['()', ['function', null, ['arraypattern'], s], ['array']]) + unregister(temp[1]);
    };
    /*@913:5*/
    return expression(['?', condition, defaultv, temp]);
};
patternMatch = function(tree) {
    var pattern, subject, temp, s;
    /*@916:5*/
    (function(r1) {
        pattern = r1[1];
        subject = r1[2];
        return r1;
    })(tree);
    /*@918:5*/
    temp = ['identifier', getVarName('r')];
    s = (pattern[0] === 'arraypattern') ? arraypattern(pattern, temp) : objpattern(pattern, temp);
    s.push(['keyword', 'return', temp]);
    /*@922:5*/
    return formatCode([('(function(' + expression(temp)) + ') {', [statements(s)], ('})(' + expression(subject)) + ')']) + unregister(temp[1]);
};
arraypattern = function(tree, ref) {
    var s, spreadindex, hasSpread, i1, l, node, i;
    /*@929:5*/
    s = ['statements'];
    spreadindex = tree.map(function(x) {
        return x[0];
    }).indexOf('spread');
    /*@931:5*/
    hasSpread = spreadindex !== (-1);
    if (spreadindex < 0) {
        spreadindex = tree.length;
    };
    /*@934:5*/
    l = tree;
    for (i1 in l) {
        node = l[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!((function() {
        var r1, r2, r3;
        r1 = 1;
        r2 = i;
        r3 = spreadindex;
        return (r1 <= r2) && (r2 < r3);
    })())) continue;
        var isProperPattern, hasDefault, temp;
        /*@935:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@937:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['number', i - 1]]]];
        if (hasDefault) {
            /*@943:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@946:5*/
    if (hasSpread && (!equals(tree[spreadindex][1], ['keyword', '_']))) {
        var isProperPattern, hasDefault, temp;
        node = tree[spreadindex][1];
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        /*@949:9*/
        hasDefault = (!isProperPattern) && (node[1] != null);
        temp = null;
        if (spreadindex === (tree.length - 1)) {
            /*@953:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['.', ref, ['identifier', 'length']]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1]]]]];
        } else {
            var afterspreadcount;
            afterspreadcount = (tree.length - 1) - spreadindex;
            /*@967:13*/
            temp = ['=', isProperPattern ? node : node[0], ['?', ['>=', ['number', spreadindex - 1], ['-', ['.', ref, ['identifier', 'length']], ['number', afterspreadcount]]], ['array'], ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], ['array', ref, ['number', spreadindex - 1], ['-', ['number', afterspreadcount]]]]]];
        };
        if (hasDefault) {
            temp[2] = ['??', temp[2], node[1]];
        };
        /*@980:9*/
        s.push(temp);
    };
    l = tree;
    for (i1 in l) {
        node = l[i1];
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(spreadindex < i)) continue;
        var isProperPattern, hasDefault, temp;
        /*@983:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@985:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], ['[]', ref, ['array', ['-', ['.', ref, ['identifier', 'length']], ['number', tree.length - i]]]]];
        if (hasDefault) {
            /*@994:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@997:5*/
    return s;
};
objpattern = function(tree, ref) {
    var s, i1, l, key, node, i;
    /*@1000:5*/
    s = ['statements'];
    l = tree;
    for (i1 in l) {
        (function(r4) {
            key = r4[0];
            node = r4[1];
            return r4;
        })(l[i1]);
        i = +i1;
        if (isNaN(i)) i = i1;
        if (!(i >= 1)) continue;
        var isProperPattern, hasDefault, temp;
        /*@1003:9*/
        isProperPattern = inOp(node[0], ['arraypattern', 'objpattern']);
        hasDefault = (!isProperPattern) && (node[1] != null);
        if ((!isProperPattern) && (equals(node[0], ['keyword', '_']))) {
            /*@1005:65*/
            continue;
        };
        temp = ['=', isProperPattern ? node : node[0], (key[0] === 'identifier') ? ['.', ref, key] : ['[]', ref, ['array', key]]];
        if (hasDefault) {
            /*@1013:24*/
            temp[2] = ['??', temp[2], node[1]];
        };
        s.push(temp);
    };
    /*@1016:5*/
    return s;
};
classStatement = function(tree) {
    var classname, superclass, functions, constructor, s;
    /*@1019:5*/
    (function(r4) {
        classname = r4[1];
        superclass = r4[2];
        functions = r4[3];
        return r4;
    })(tree);
    /*@1020:5*/
    exports.currentClassName = classname[1];
    if (superclass != null) {
        var temp;
        temp = ['identifier', addFlag('extend')];
    };
    /*@1024:5*/
    functions = functions.filter(function(x) {
        return x[0] === 'function';
    }).map(function(f) {
        f[3].splice(1, 0, ['=', ['identifier', 'self'], ['keyword', 'this']]);
        /*@1028:9*/
        return f;
    });
    constructor = functions.filter(function(x) {
        return x[1][1] === 'init';
    })[0];
    /*@1032:5*/
    if (constructor == null) {
        constructor = ['function', ['identifier', 'init'], ['arraypattern'], ['statements']];
        if (superclass != null) {
            /*@1036:13*/
            constructor[3].push(['=', ['identifier', 'self'], ['keyword', 'this']]);
            constructor[3].push(['()', ['.', ['.', ['.', classname, ['identifier', '__super__']], ['identifier', 'init']], ['identifier', 'apply']], ['array', ['identifier', 'self'], ['identifier', 'arguments']]]);
        };
    };
    /*@1045:5*/
    s = ['statements'];
    s.push(constructor);
    if (superclass != null) {
        /*@1048:28*/
        s.push(['()', temp, ['array', ['identifier', 'init'], superclass]]);
    };
    s = s.concat(functions.filter(function(f) {
        return f !== constructor;
    }).map(function(f) {
        var name;
        /*@1054:9*/
        (function(r4) {
            name = r4[0];
            f[1] = r4[1];
            return r4;
        })([f[1], null]);
        /*@1055:9*/
        return ['=', ['.', ['.', ['identifier', 'init'], ['identifier', 'prototype']], name], f];
    }));
    s.push(['keyword', 'return', ['identifier', 'init']]);
    return expression(['=', classname, ['()', ['function', null, ['arraypattern'], s], ['array']]]);
};
})();
