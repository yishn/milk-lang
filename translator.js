exports.translate = function(tree, indent) {
    if (!indent) indent = '    '

    exports.indent = indent
    exports.flags = {}
    exports.identifiers = getIdentifiers(tree)
    exports.currentScope = {
        vars: [],
        children: [],
        parent: null
    }

    var code = statements(tree)
    var vars = popScope()

    return [
        '(function() {',
        'var _ = {}' + (vars.length > 0 ? ', ' + vars.join(', ') : '') + ';',
        underscore(),
        code,
        '})();'
    ].join('\n')
}

function underscore() {
    var output = []

    if (exports.flags.modulo) {
        output.push(formatCode([
            '_.modulo = function(a, b) {', [
                'var c = a % b;',
                'return c >= 0 ? c : c + b;'
            ], '}'
        ]))
    }
    if (exports.flags.enumerate) {
        output.push(formatCode([
            '_.enumerate = function(l) {', [
                'var t = toString.call(l);',
                'if (t !== "[object Array]" && t !== "[object String]")', [
                    'return Object.keys(l);'
                ], 'return l;'
            ], '}'
        ]))
    }
    if (exports.flags.inOp) {
        output.push(formatCode([
            '_.inOp = function(x, l) {', [
                'var t = toString.call(l);',
                'if (t !== "[object Array]" && t !== "[object String]")', [
                    'return x in l;'
                ], 'return l.indexOf(x) != -1;'
            ], '}'
        ]))
    }
    if (exports.flags.extends) {
        output.push(formatCode([
            '_.extends = function(x, y) {', [
                'var copy = function() {}',
                'copy.prototype = y.prototype;',
                'var c = new copy();',
                'c.constructor = x;',
                'x.prototype = c;',
                'x.prototype.__super__ = y.prototype;',
                'x.prototype.__super__.init = y.prototype.constructor;',
                'return x;',
            ], '}'
        ]))
    }
    if (exports.flags.equals) {
        output.push(formatCode([
            '_.equals = function(a, b) {', [
                'if (a === b) return true;',
                'if (a == null || b == null) return a == b;',
                'var t = toString.call(a);',
                'if (t !== toString.call(b)) return false;',
                'var aa = t === "[object Array]";',
                'var ao = t === "[object Object]";',
                'if (aa) {', [
                    'if (a.length !== b.length) return false;',
                    'for (var i = 0; i < a.length; i++)', [
                        'if (!_.equals(a[i], b[i])) return false;'
                    ], 'return true;'
                ], '} else if (ao) {', [
                    'var akeys = Object.keys(a);',
                    'if (akeys.length !== Object.keys(b).length) return false;',
                    'for (var i = 0; i < akeys.length; i++) {', [
                        'key = akeys[i];',
                        'if (!(key in b)) return false;',
                        'if (!_.equals(a[key], b[key])) return false;'
                    ], '}',
                    'return true;'
                ], '}',
                'return false;'
            ], '}'
        ]))
    }

    return output.join('\n')
}

// Helper functions

function pushScope() {
    var scope = {
        vars: [],
        children: [],
        parent: exports.currentScope
    }

    exports.currentScope.children.push(scope)
    exports.currentScope = scope
    return ''
}

function popScope() {
    if (!exports.currentScope) throw 'no scope'
    var scope = exports.currentScope
    exports.currentScope = exports.currentScope.parent
    return scope.vars
}

function register(varname) {
    if (!isObservable(varname))
        exports.currentScope.vars.push(varname)
    return varname
}

function isObservable(varname, scope) {
    if (!scope) scope = exports.currentScope
    return scope.vars.indexOf(varname) != -1 ||
        scope.parent != null && isObservable(varname, scope.parent)
}

function getIdentifiers(tree, list) {
    if (!list) list = []
    if (tree[0] == 'identifier') {
        if (list.indexOf(tree[1]) == -1)
            list.push(tree[1])
    }

    tree.filter(function(x) {
        return x !== null && typeof x == 'object'
    }).forEach(function(x) {
        getIdentifiers(x, list)
    })

    return list
}

function getVarName(base) {
    var r

    if (exports.identifiers.indexOf(base) == -1) {
        r = base
    } else {
        var i = 1
        r = base + i
        while (exports.identifiers.indexOf(r) != -1)
            r = base + ++i
    }

    exports.identifiers.push(r)
    return r
}

function getCheckExistenceWrapper(token) {
    var needTempVar = token[0] != 'identifier' && token[0] != 'keyword'
    var temp = needTempVar ? ['identifier', getVarName('r')] : token

    var output = function(tree) {
        var s = ['statements']
        if (needTempVar) s.push(['=', temp, token])
        s.push(['if',
            [
                ['or',
                    ['==', ['typeof', temp], ['string', "'undefined'"]],
                    ['==', temp, ['keyword', 'null']]
                ],
                ['statements', ['keyword', 'return', ['keyword', 'null']]]
            ]
        ])
        s.push(['keyword', 'return', tree])

        return expression(['()', ['function', null, [], s], []])
    }

    return [output, temp]
}

function formatCode(input) {
    return input.filter(function(x) {
        return typeof x === 'string' ? x.trim() != '' : x !== null
    }).map(function(x) {
        if (typeof x == 'string')
            return x

        return formatCode(x).split('\n').map(function(y) {
            return exports.indent + y
        }).join('\n')
    }).join('\n')
}

function paren(tree) {
    if (['.', '?.', '()', '?()', '[]', '?[]', 'bool', 'number', 'number', 'keyword', 'identifier', 'array', 'object', 'string', '^', '%', 'chaincmp', '??', 'range'].indexOf(tree[0]) != -1)
        return expression(tree)
    return '(' + expression(tree) + ')'
}

// Translator functions

function varsDefinition(vars) {
    if (vars.length != 0)
        return 'var ' + vars.join(', ') + ';'
    return ''
}

function statements(tree) {
    var statements = []

    for (var i = 1; i < tree.length; i++) {
        var s = statement(tree[i])
        if (s[s.length - 1] != '}') s += ';'
        if ('offset' in tree[i])
            s = '#OFFSET' + tree[i].offset + '\n' + s

        statements.push(s)
    }

    return formatCode(statements)
}

function statement(tree) {
    if (tree[1] == 'delete') {
        return deleteStatement(tree)
    } else if (tree[0] == 'keyword') {
        if (tree[1] == 'pass') return ''
        return tree[1] + (tree[2] ? ' ' + expression(tree[2]) : '')
    } else if (tree[0] == 'for') {
        return forStatement(tree)
    } else if (tree[0] == 'while') {
        return whileStatement(tree)
    } else if (tree[0] == 'if') {
        return ifStatement(tree)
    } else if (tree[0] == 'try') {
        return tryStatement(tree)
    } else if (tree[0] == 'class') {
        return classStatement(tree)
    }

    return expression(tree)
}

function deleteStatement(tree) {
    if (tree[2][0] != '[]' || tree[2][2][0] != 'range') {
        return 'delete ' + expression(tree[2])
    } else {
        var temp = getVarName('i')
        var indexer = tree[2]
        var range = tree[2][2]

        return forStatement([
            'for',
            [['identifier', temp], null],
            range,
            null,
            ['statements',
                ['keyword', 'delete',
                    ['[]', indexer[1], ['identifier', temp]]
                ]
            ]
        ])
    }
}

function expression(tree) {
    if (['number', 'bool', 'keyword', 'identifier', 'regex'].indexOf(tree[0]) != -1) {
        return tree[1]
    } else if (tree[0] == 'string') {
        return tree[1].replace(/\n/g, '\\n')
    } else if (tree[0].indexOf('array') == 0) {
        return array(tree)
    } else if (tree[0].indexOf('object') == 0) {
        return object(tree)
    } else if (tree[0] == 'function') {
        return func(tree)
    } else if (tree[0] == '=') {
        return assignment(tree)
    } else if (tree[0] == '==' || tree[0] == '!=') {
        var op = tree[2][0] == 'keyword' && tree[2][1] == 'null' ? tree[0] : tree[0] + '='
        return [paren(tree[1]), op, paren(tree[2])].join(' ')
    } else if (tree[0] == 'equals' || tree[0] == 'not equals') {
        exports.flags.equals = true
        var output = '_.equals(' + expression(tree[1]) + ', ' + expression(tree[2]) + ')'
        return tree[0] == 'equals' ? output : '!' + output
    } else if (tree[0].length == 2 && tree[0][1] == '=') {
        return [paren(tree[1]), tree[0], paren(tree[2])].join(' ')
    } else if (tree[0] == 'lambda') {
        return lambda(tree)
    } else if (tree[0] == '?') {
        return paren(tree[1]) + ' ? ' + paren(tree[2]) + ' : ' + paren(tree[3])
    } else if (tree[0] == '??') {
        return existentialOp(tree)
    } else if (tree[0] == 'or') {
        return paren(tree[1]) + ' || ' + paren(tree[2])
    } else if (tree[0] == 'and') {
        return paren(tree[1]) + ' && ' + paren(tree[2])
    } else if (tree[0] == 'not') {
        return '!' + paren(tree[1])
    } else if (tree[0] == 'chaincmp') {
        return chainCmp(tree)
    } else if (['<', '>', '+', '-', '*', '/', 'instanceof'].indexOf(tree[0]) != -1 && tree.length == 3) {
        return [paren(tree[1]), tree[0], paren(tree[2])].join(' ')
    } else if (tree[0] == '%') {
        exports.flags.modulo = true
        return '_.modulo(' + expression(tree[1]) + ', ' + expression(tree[2]) + ')'
    } else if (tree[0] == '^') {
        return 'Math.pow(' + expression(tree[1]) + ', ' + expression(tree[2]) + ')'
    } else if (tree[0] == 'in' || tree[0] == 'not in') {
        exports.flags.inOp = true
        var output = '_.inOp(' + expression(tree[1]) + ', ' + expression(tree[2]) + ')'
        return tree[0] == 'in' ? output : '!' + output
    } else if (['+', '-', '++_', '--_', 'typeof', 'new'].indexOf(tree[0]) != -1) {
        var op = ['new', 'typeof'].indexOf(tree[0]) != -1 ? tree[0] + ' ' : tree[0].replace('_', '')
        return op + paren(tree[1])
    } else if (tree[0] == '_++' || tree[0] == '_--') {
        return paren(tree[1]) + tree[0].substr(1)
    } else if (tree[0] == '.' || tree[0] == '?.') {
        return dotOp(tree)
    } else if (tree[0] == '()' || tree[0] == '?()') {
        return funcCall(tree)
    } else if (tree[0] == '[]' || tree[0] == '?[]') {
        return index(tree)
    } else if (tree[0] == 'range') {
        return range(tree)
    }

    console.dir(tree, { depth: null })
    return '/* ... */'
}

function assignment(tree) {
    var patternmatch = tree[1][0] == 'arraypattern' || tree[1][0] == 'objpattern'
    var assignRange = tree[1][0] == '[]' && tree[1][2][0] == 'range'

    if (patternmatch) return patternMatch(tree)

    if (tree[1][0] == 'identifier') {
        register(tree[1][1])
    }

    if (!assignRange) {
        return [paren(tree[1]), '=', expression(tree[2])].join(' ')
    } else if (assignRange && tree[1][2][2] == null) {
        var range = tree[1][2]
        var rtemp = ['identifier', getVarName('r')]
        var starttemp = ['identifier', getVarName('start')]
        var lentemp = ['identifier', getVarName('len')]

        return expression(['()', ['function', null, [], ['statements',
            ['=', rtemp, tree[1][1]],
            ['=', starttemp, range[1]],
            ['=', lentemp, range[3]
                ? ['-', ['+', range[3], ['number', 1]], starttemp]
                : ['.', rtemp, ['identifier', 'length']]
            ],
            ['()',
                ['.',
                    ['.', ['array'], ['identifier', 'splice']],
                    ['identifier', 'apply']
                ], [
                    rtemp,
                    ['()', ['.',
                        ['array', starttemp, lentemp],
                        ['identifier', 'concat']
                    ], [tree[2]]]
                ]
            ],
            ['keyword', 'return', rtemp]
        ]], []])
    } else if (assignRange) {
        var range = tree[1][2]
        var rtemp = ['identifier', getVarName('r')]
        var listtemp = ['identifier', getVarName('l')]
        var itemp = ['identifier', getVarName('i')]
        var jtemp = ['identifier', getVarName('j')]

        return expression(['()', ['function', null, [], ['statements',
            ['=', rtemp, tree[1][1]],
            ['=', listtemp, tree[2]],
            ['for', [itemp, jtemp], range, null, ['statements',
                ['=', ['[]', rtemp, jtemp], ['[]', listtemp, itemp]]
            ]],
            ['keyword', 'return', rtemp]
        ]], []])
    }
}

function dotOp(tree) {
    if (tree[0][0] != '?') {
        return paren(tree[1]) + '.' + expression(tree[2])
    } else {
        var r = getCheckExistenceWrapper(tree[1])
        return r[0](['.', r[1], tree[2]])
    }
}

function array(tree) {
    if (tree[0] != 'arrayfor') {
        return '[' + tree.slice(1).map(function(x) {
            return expression(x)
        }).join(', ') + ']'
    } else {
        var temp = ['identifier', getVarName('r')]
        var fortree = tree[1]
        fortree[4] = ['statements', ['()',
            ['.', temp, ['identifier', 'push']],
            [fortree[4]]
        ]]

        var s = ['statements',
            ['=', temp, ['array']],
            fortree,
            ['keyword', 'return', temp]
        ]

        return expression(['()', ['function', null, [], s], []])
    }
}

function object(tree) {
    if (tree[0] != 'objectfor') {
        if (tree.length == 1) return '{}'

        return formatCode([
            '{',
            tree.slice(1).map(function(x, i) {
                return expression(x[0]) + ': ' + expression(x[1])
                    + (i == tree.length - 2 ? '' : ',')
            }),
            '}'
        ])
    } else {
        var fortree = tree[1]
        var key = fortree[4][0]
        var value = fortree[4][1]
        var temp = ['identifier', getVarName('r')]

        fortree[4] = ['statements', ['=', ['[]',
            temp, key
        ], value]]

        var s = ['statements',
            ['=', temp, ['object']],
            fortree,
            ['keyword', 'return', temp]
        ]

        return expression(['()', ['function', null, [], s], []])
    }
}

function index(tree) {
    var output

    if (tree[0][0] != '?' && tree[2][0] != 'range') {
        return paren(tree[1]) + '[' + expression(tree[2]) + ']'
    }

    if (tree[2][0] != 'range') {
        output = function(token) {
            return ['[]', token, tree[2]]
        }
    } else {
        var start = tree[2][1]

        if (tree[2][3] == null) {
            output = function(token) {
                return ['()',
                    ['.', token, ['identifier', 'slice']],
                    [start]
                ]
            }
        } else {
            var end = tree[2][3]
            output = function(token) {
                var t = ['()',
                    ['.', token, ['identifier', 'slice']],
                    [start, ['+', end, ['number', 1]]]
                ]

                if (tree[2][2] == null) return t

                var modulo = ['-', tree[2][2], tree[2][1]]
                var xtemp = ['identifier', getVarName('x')]
                var itemp = ['identifier', getVarName('i')]

                return ['()',
                    ['.', t, ['identifier', 'filter']],
                    [['lambda', null, [[xtemp, null], [itemp, null]],
                        ['==',
                            ['%', itemp, modulo],
                            ['number', 0]
                        ]
                    ]]
                ]
            }
        }
    }

    if (tree[0][0] == '?') {
        var r = getCheckExistenceWrapper(tree[1])
        return r[0](output(r[1]))
    }

    return expression(output(tree[1]))
}

function funcCall(tree) {
    var output = ''
    var placeholderCount = tree[2].filter(function(x) {
        return x[0] == 'keyword' && x[1] == '_'
            || x[0] == 'spread' && x[1][1] == '_'
    }).length
    var hasSpread = tree[2].some(function(x) {
        return x[0] == 'spread'
    })

    var callsuper = (tree[1][0] == '.' || tree[1][0] == '?.') && tree[1][1][0] == 'keyword' && tree[1][1][1] == 'super'
    if (callsuper) {
        tree[1] = ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], tree[1][2]], ['identifier', 'call']]
        tree[2].splice(0, 0, ['identifier', 'self'])
    }

    if (placeholderCount == 0 && !hasSpread && tree[0][0] != '?') {
        return paren(tree[1]) + '(' + tree[2].map(function(x) {
            return expression(x)
        }).join(', ') + ')'
    }

    if (placeholderCount == 0) {
        if (!hasSpread) {
            output = function(token) {
                return ['()', token, tree[2]]
            }
        } else {
            var s = ['statements']
            var temp = ['identifier', getVarName('r')]

            s.push(['=', temp, ['array']])

            tree[2].forEach(function(x) {
                if (x[0] != 'spread')
                    s.push(['()', ['.', temp, ['identifier', 'push']], [x]])
                else
                    s.push(['()', ['.', ['.',
                        temp,
                        ['identifier', 'push']],
                        ['identifier', 'apply']
                    ], [temp, x[1]]])
            })


            output = function(token) {
                s.push(['keyword', 'return', ['()',
                    ['.', token, ['identifier', 'apply']], [['keyword', 'this'], temp]
                ]])
                return ['()', ['function', null, [], s], []]
            }
        }
    } else {
        var temps = []
        for (var i = 0; i < placeholderCount; i++)
            temps.push(getVarName('x'))

        output = function(token) {
            return ['lambda', null, temps.map(function(x) {
                return [['identifier', x], null]
            }), ['()', token, tree[2].map(function(x) {
                if (x[0] == 'keyword' && x[1] == '_') {
                    var temp = temps.splice(0, 1)[0]
                    return ['identifier', temp]
                } else if (x[0] == 'spread' && x[1][1] == '_') {
                    var temp = temps.splice(0, 1)[0]
                    return ['spread', ['identifier', temp]]
                } else {
                    return x
                }
            })]]
        }
    }

    if (tree[0][0] == '?') {
        var r = getCheckExistenceWrapper(tree[1])
        return r[0](output(r[1]))
    }

    return expression(output(tree[1]))
}

// Block constructs

function func(tree) {
    var identifier = tree[1] ? register(expression(tree[1])) : null
    var funcargs = tree[2]
    var hasOptionalArgs = funcargs.some(function(x) {
        return x[1] !== null
    })
    var spreadindex = funcargs.map(function(x) { return x[0][0] }).indexOf('spread')
    var hasSpread = spreadindex != -1
    if (spreadindex == -1) spreadindex = funcargs.length

    var output = (identifier ? identifier + ' = ' : '') + 'function('

    pushScope()
    if (!hasSpread) output += funcargs.map(function(x) {
        return expression(x[0])
    }).join(', ')

    output += ') {'
    var insert = []

    if (hasSpread) {
        var s = ['statements']
        var pattern = ['arraypattern'].concat(funcargs.map(function(x) {
            return x[0]
        }))
        var itemp = ['identifier', getVarName('i')]

        s.push(['=', pattern, ['keyword', 'arguments']])
        insert.push(statements(s))
    }

    funcargs.forEach(function(x) {
        if (x[1] == null) return
        insert.push(x[0][0] + ' = ' + expression(['??', x[0], x[1]]))
    })

    var code = [output, [
        insert.join('\n'),
        statements(tree[3])
    ], '}'], vars = popScope()

    code[1].splice(0, 0, varsDefinition(vars))
    return formatCode(code)
}

function forHead(tree) {
    var firstIdentifier = expression(tree[1][0])
    var secondIdentifier = tree[1][1] ? expression(tree[1][1]) : null
    if (firstIdentifier == '_') firstIdentifier = getVarName('x')
    if (secondIdentifier == '_') secondIdentifier = getVarName('y')
    register(firstIdentifier)
    if (secondIdentifier != null) register(secondIdentifier)

    var identifierCount = tree[1][1] ? 2 : 1
    var output = ''

    if (tree[2][0] == 'range') {
        var r = tree[2]
        var starttemp = ['identifier', getVarName('start')]
        var endtemp = r[3] ? ['identifier', getVarName('end')] : null
        var steptemp = ['identifier', getVarName('step')]

        var start = r[1]
        var end = r[3]
        var step = (function() {
            if (r[2]) return ['-', r[2], starttemp]
            if (end) return ['?',
                ['==', endtemp, starttemp],
                ['number', 1],
                ['()', ['.',
                    ['identifier', 'Math'],
                    ['identifier', 'sign']],
                    [['-', endtemp, starttemp]]
                ]
            ]
            return ['number', 1]
        })()

        var s = ['statements', ['=', starttemp, start]]
        if (end != null) s.push(['=', endtemp, end])
        s.push(['=', steptemp, step])

        if (!secondIdentifier) {
            output = formatCode([
                statements(s),
                'for (' + firstIdentifier + ' = ' + starttemp[1] + '; '
                    + (end ? steptemp[1] + ' > 0 ? ' + firstIdentifier + ' <= ' + endtemp[1] + ' : ' + firstIdentifier + ' >= ' + endtemp[1] : 'true') + '; '
                    + firstIdentifier + ' += ' + steptemp[1] + ') {'
            ])
        } else {
            output = formatCode([
                statements(s),
                'for (' + secondIdentifier + ' = ' + starttemp[1] + ', ' + firstIdentifier + ' = 0; '
                    + (end ? steptemp[1] + ' > 0 ? ' + secondIdentifier + ' <= ' + endtemp[1] + ' : ' + secondIdentifier + ' >= ' + endtemp[1] : 'true') + '; '
                    + secondIdentifier + ' += ' + steptemp[1] + ', ' + firstIdentifier + '++) {'
            ])
        }
    } else if (identifierCount == 1) {
        exports.flags.enumerate = true
        var listtemp = register(getVarName('l'))
        var itemp = register(getVarName('i'))

        var s = ['statements', ['=', ['identifier', listtemp],
            ['()', ['.',
                ['keyword', '_'],
                ['identifier', 'enumerate']
            ], [tree[2]]]
        ]]

        output = formatCode([
            statements(s),
            'for (' + itemp + ' = 0; ' + itemp + ' < ' + listtemp + '.length; ' + itemp + '++) {', [
                firstIdentifier == '_' ? '' : firstIdentifier + ' = ' + listtemp + '[' + itemp + '];'
            ]
        ])
    } else {
        var listtemp = getVarName('l')
        var s = ['statements', ['=', ['identifier', listtemp], tree[2]]]

        output = formatCode([
            statements(s),
            'for (' + firstIdentifier + ' in ' + listtemp + ') {', [
                secondIdentifier == '_' ? '' : secondIdentifier + ' = ' + listtemp + '[' + firstIdentifier + '];'
            ]
        ])
    }

    if (tree[3]) {
        output += '\n' + exports.indent
            + 'if (!(' + expression(tree[3]) + ')) continue;'
    }

    return output
}

function forStatement(tree) {
    var code = [forHead(tree), [
        pushScope() + statements(tree[4])
    ], '}'], vars = popScope()

    code[1].splice(0, 0, varsDefinition(vars))
    return formatCode(code)
}

function whileStatement(tree) {
    var code = ['while (' + expression(tree[1]) + ') {', [
        pushScope() + statements(tree[2])
    ], '}'], vars = popScope()

    code[1].splice(0, 0, varsDefinition(vars))
    return formatCode(code)
}

function ifStatement(tree) {
    var code = ['if (' + expression(tree[1][0]) + ') {', [
        pushScope() + statements(tree[1][1])
    ], '}'], vars = popScope()

    code[1].splice(0, 0, varsDefinition(vars))
    var output = formatCode(code)

    for (var i = 2; i < tree.length; i++) {
        code = [tree[i][0] == 'else'
            ? ' else {' + pushScope()
            : ' else if (' + expression(tree[i][0]) + ') {' + pushScope(), [
                statements(tree[i][1])
            ], '}'
        ]
        vars = popScope()
        code[1].splice(0, 0, varsDefinition(vars))
        output += formatCode(code)
    }

    return output
}

function tryStatement(tree) {
    var code = ['try {', [
        pushScope() + statements(tree[1])
    ], '}'], vars = popScope()

    code[1].splice(0, 0, varsDefinition(vars))
    var output = formatCode(code)

    if (tree[2] != null) {
        code = [' catch (' + expression(tree[2][0]) + ') {', [
            pushScope() + statements(tree[2][1])
        ], '}']
        vars = popScope()

        code[1].splice(0, 0, varsDefinition(vars))
        output += formatCode(code)
    } else {
        var temp = getVarName('e')
        output += ' catch(' + temp + ') {}'
    }

    if (tree[3] != null) {
        code = [' finally {', [
            pushScope() + statements(tree[3])
        ], '}']
        vars = popScope()

        code[1].splice(0, 0, varsDefinition(vars))
        output += formatCode(code)
    }

    return output
}

// Rewriter functions

function chainCmp(tree) {
    var temps = []
    var s = ['statements']

    var varDeclaration = tree.filter(function(x, i) {
        return i % 2 != 0
    }).forEach(function(x) {
        var temp = ['identifier', getVarName('r')]
        temps.push(temp)
        s.push(['=', temp, x])
    })

    var expr = temps[0]
    for (var i = 3; i < tree.length; i += 2) {
        if (i == 3) expr = [tree[i - 1], expr, temps[(i + 1) / 2 - 1]]
        else expr = ['and', expr, [tree[i - 1], temps[(i - 1) / 2 - 1], temps[(i + 1) / 2 - 1]]]
    }

    s.push(['keyword', 'return', expr])
    return expression(['()', ['function', null, [], s], []])
}

function range(tree) {
    var temp = ['identifier', getVarName('i')]
    return array(['arrayfor', ['for', [temp, null], tree, null, temp]])
}

function lambda(tree) {
    return func([
        'function', null, tree[2],
        ['statements', ['keyword', 'return', tree[3]]]
    ])
}

function existentialOp(tree) {
    var needTempVar = tree[1][0] != 'identifier' && tree[1][0] != 'keyword'
    var temp = needTempVar ? ['identifier', getVarName('r')] : tree[1]
    var condition = ['or',
        ['==', ['typeof', temp], ['string', "'undefined'"]],
        ['==', temp, ['keyword', 'null']]]

    if (needTempVar) {
        var s = ['statements']

        s.push(['=', temp, tree[1]])
        s.push(['if', [condition, ['statements',
            ['keyword', 'return', tree[2]]
        ]]])
        s.push(['keyword', 'return', temp])

        return expression(['()', ['function', null, [], s], []])
    } else {
        return expression(['?', condition, tree[2], temp])
    }
}

function classStatement(tree) {
    var classname = tree[1]
    var superclass = tree[2] ? tree[2] : null
    if (superclass != null) exports.flags.extends = true

    var functionList = tree[3].filter(function(x) {
        return x[0] == 'function'
    }).map(function(f) {
        f[3].splice(1, 0, ['=', ['identifier', 'self'], ['keyword', 'this']])
        return f
    })
    var constructor = functionList.filter(function(x) {
        return x[1][1] === 'init'
    })[0]

    if (constructor == null) {
        constructor = ['function', ['identifier', 'init'], [], ['statements']]
        if (superclass != null) {
            constructor[3].push(['=', ['identifier', 'self'], ['keyword', 'this']])
            constructor[3].push(['()', ['.', ['.', ['.',
                ['identifier', 'self'],
                ['identifier', '__super__']],
                ['identifier', 'init']],
                ['identifier', 'apply']],
                [['identifier', 'self'], ['identifier', 'arguments']]
            ])
        }
    }

    var s = ['statements']
    s.push(constructor)
    if (superclass !== null) s.push(['()',
        ['.', ['keyword', '_'], ['identifier', 'extends']],
        [['identifier', 'init'], superclass]
    ])
    s = s.concat(functionList.filter(function(f) {
        return f[1][1] !== 'init'
    }).map(function(f) {
        var name = f[1]
        f[1] = null
        return ['=', ['.',
            ['.', ['identifier', 'init'], ['identifier', 'prototype']],
            name
        ], f]
    }))
    s.push(['keyword', 'return', ['identifier', 'init']])

    return expression(['=',
        classname,
        ['()', ['function', null, [], s], []]
    ])
}

function patternMatch(tree) {
    var temp = ['identifier', getVarName('ref')]
    var s = tree[1][0] == 'arraypattern' ? arraypattern(tree[1], temp) : objpattern(tree[1], temp)
    s.push(['keyword', 'return', temp])

    return formatCode([
        '(function(' + expression(temp) + ') {', [
            statements(s)
        ], '})(' + expression(tree[2]) + ')'
    ])
}

function arraypattern(tree, ref) {
    var s = ['statements']
    var spreadindex = tree.map(function(x) { return x[0] }).indexOf('spread')
    var hasSpread = spreadindex != -1
    if (spreadindex == -1) spreadindex = tree.length

    for (var i = 1; i < spreadindex; i++) {
        if (tree[i][1] == '_') continue

        s.push(['=',
            tree[i],
            ['[]', ref, ['number', i - 1]]
        ])
    }

    if (hasSpread && tree[spreadindex][1][1] != '_') {
        if (spreadindex == tree.length - 1) {
            s.push(['=', tree[spreadindex][1], ['?',
                ['>=', ['number', spreadindex - 1], ['.',
                    ref,
                    ['identifier', 'length']
                ]],
                ['array'],
                ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], [ref, ['number', spreadindex - 1]]]
            ]])
        } else if (spreadindex < tree.length - 1) {
            var afterspreadcount = tree.length - 1 - spreadindex

            s.push(['=', tree[spreadindex][1], ['?',
                ['>=', ['number', spreadindex - 1], ['-', ['.',
                    ref,
                    ['identifier', 'length']
                ], ['number', afterspreadcount]]],
                ['array'],
                ['()', ['.', ['.', ['array'], ['identifier', 'slice']], ['identifier', 'call']], [ref, ['number', spreadindex - 1], ['-', ['number', afterspreadcount]]]]
            ]])
        }
    }

    for (var i = tree.length - 1; i > spreadindex; i--) {
        if (tree[i][1] == '_') continue

        s.push(['=',
            tree[i],
            ['[]', ref, ['-',
                ['.', ref, ['identifier', 'length']],
                ['number', tree.length - i]
            ]]
        ])
    }

    return s
}

function objpattern(tree, ref) {
    var s = ['statements']

    for (var i = 1; i < tree.length; i++) {
        if (tree[i][1][1] == '_') continue

        s.push(['=',
            tree[i][1],
            tree[i][0][0] == 'identifier'
            ? ['.', ref, tree[i][0]]
            : ['[]', ref, tree[i][0]]
        ])
    }

    return s
}
