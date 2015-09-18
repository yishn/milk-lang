exports.translate = function(tree, indent) {
    if (!indent) indent = '    '

    exports.indent = indent
    exports.flags = {}
    exports.identifiers = getIdentifiers(tree)
    exports.currentScope = {
        vars: ['_'],
        children: [],
        parent: null
    }

    var code = statements(tree)
    var vars = popScope()

    return [
        varsDefinition(vars),
        code
    ].join('\n')
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
    if (['number', 'bool', 'keyword', 'identifier'].indexOf(tree[0]) != -1) {
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
        return [paren(tree[1]), tree[0] + '=', paren(tree[2])].join(' ')
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

    console.log(tree)
    return '/* ... */'
}

function assignment(tree) {
    var assignRange = tree[1][0] == '[]' && tree[1][2][0] == 'range'

    if (tree[1][0] == 'identifier') {
        register(tree[1][1])
    }

    if (!assignRange) {
        return [paren(tree[1]), '=', expression(tree[2])].join(' ')
    } else if (assignRange && tree[1][2][2] == null) {
        var range = tree[1][2]
        var rtemp = ['identifier', getVarName('r')]
        var starttemp = ['identifier', getVarName('start')]
        var counttemp = ['identifier', getVarName('count')]

        return expression(['()', ['function', null, [], ['statements',
            ['=', rtemp, tree[1][1]],
            ['=', starttemp, range[1]],
            ['=', counttemp, range[3]
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
                        ['array', starttemp, counttemp],
                        ['identifier', 'concat']
                    ], [tree[2]]]
                ]
            ],
            ['keyword', 'return', rtemp]
        ]], []])
    } else if (assignRange) {
        var range = tree[1][2]
        var rtemp = ['identifier', getVarName('r')]
        var listtemp = ['identifier', getVarName('list')]
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
    }).length

    var callsuper = (tree[1][0] == '.' || tree[1][0] == '?.') && tree[1][1][0] == 'keyword' && tree[1][1][1] == 'super'
    if (callsuper) {
        tree[1] = ['.', ['.', ['.', ['identifier', 'self'], ['identifier', '__super__']], tree[1][2]], ['identifier', 'call']]
        tree[2].splice(0, 0, ['identifier', 'self'])
    }

    if (placeholderCount == 0 && tree[0][0] != '?') {
        return paren(tree[1]) + '(' + tree[2].map(function(x) {
            return expression(x)
        }).join(', ') + ')'
    }

    if (placeholderCount == 0) {
        output = function(token) {
            return ['()', token, tree[2]]
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
                    var temp = temps.splice(0, 1)
                    return ['identifier', temp[0]]
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
    var funcargs = tree[2].map(function(x) {
        return [x[0], x[1]]
    })
    var hasOptionalArgs = funcargs.some(function(x) {
        return x[1] !== null
    })
    var spreadindex = funcargs.map(function(x) { return x[1] }).indexOf('*')
    if (spreadindex == -1) spreadindex = funcargs.length

    var output = (identifier ? identifier + ' = ' : '') + 'function('

    pushScope()
    if (!hasOptionalArgs) output += funcargs.map(function(x) {
        return expression(x[0])
    }).join(', ')

    output += ') {'
    var s = ['statements']

    if (hasOptionalArgs) {
        for (var i = 0; i < spreadindex; i++) {
            var value = ['[]', ['identifier', 'arguments'], ['number', i]]
            if (funcargs[i][1] !== null) {
                value = ['??', value, funcargs[i][1]]
            }
            s.push(['=', funcargs[i][0], value])
        }

        if (spreadindex == funcargs.length - 1) {
            s.push(['=', funcargs[spreadindex][0], ['?',
                ['>=', ['number', spreadindex], ['.',
                    ['identifier', 'arguments'],
                    ['identifier', 'length']
                ]],
                ['array'],
                ['()', ['.', ['identifier', 'arguments'], ['identifier', 'slice']], [['number', spreadindex]]]
            ]])
        } else if (spreadindex < funcargs.length - 1) {
            var afterspreadcount = funcargs.length - 1 - spreadindex

            s.push(['=', funcargs[spreadindex][0], ['?',
                ['>=', ['number', spreadindex], ['-', ['.',
                    ['identifier', 'arguments'],
                    ['identifier', 'length']
                ], ['number', afterspreadcount]]],
                ['array'],
                ['()', ['.', ['identifier', 'arguments'], ['identifier', 'slice']], [['number', spreadindex], ['-', ['number', afterspreadcount]]]]
            ]])
        }

        for (var i = funcargs.length - 1; i > spreadindex; i--) {
            var value = ['[]', ['identifier', 'arguments'], ['-',
                ['.', ['identifier', 'arguments'], ['identifier', 'length']],
                ['number', funcargs.length - i]
            ]]
            if (funcargs[i][1] !== null) {
                value = ['??', value, funcargs[i][1]]
            }
            s.push(['=', funcargs[i][0], value])
        }
    }

    var code = [output, [
        statements(s),
        statements(tree[3])
    ], '}'], vars = popScope()

    code[1].splice(0, 0, varsDefinition(vars))
    return formatCode(code)
}

function forHead(tree) {
    var firstIdentifier = register(expression(tree[1][0]))
    var secondIdentifier = tree[1][1] ? register(expression(tree[1][1])) : null
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
                    + (end ? firstIdentifier + ' <= ' + endtemp[1] : 'true') + '; '
                    + firstIdentifier + ' += ' + steptemp[1] + ') {'
            ])
        } else {
            output = formatCode([
                statements(s),
                'for (' + secondIdentifier + ' = ' + starttemp[1] + ', ' + firstIdentifier + ' = 0; '
                    + (end ? secondIdentifier + ' <= ' + endtemp[1] : 'true') + '; '
                    + secondIdentifier + ' += ' + steptemp[1] + ', ' + firstIdentifier + '++) {'
            ])
        }
    } else if (identifierCount == 1) {
        exports.flags.enumerate = true
        var listtemp = register(getVarName('list'))
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
                firstIdentifier + ' = ' + listtemp + '[' + itemp + '];'
            ]
        ])
    } else {
        var listtemp = getVarName('list')
        var s = ['statements', ['=', ['identifier', listtemp], tree[2]]]

        output = formatCode([
            statements(s),
            'for (' + firstIdentifier + ' in ' + listtemp + ') {', [
                secondIdentifier + ' = ' + listtemp + '[' + firstIdentifier + '];'
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
    var s = ['statements']

    if (needTempVar) s.push(['=', temp, tree[1]])
    s.push(['if',
        [
            ['or',
                ['==', ['typeof', temp], ['string', "'undefined'"]],
                ['==', temp, ['keyword', 'null']]
            ],
            ['statements', ['keyword', 'return', tree[2]]]
        ]
    ])
    s.push(['keyword', 'return', temp])
    return expression(['()', ['function', null, [], s], []])
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
        if (superclass != null)
            constructor[3].push(['=', ['identifier', 'self'], ['keyword', 'this']])
            constructor[3].push(['()', ['.', ['.', ['.',
                ['identifier', 'self'],
                ['identifier', '__super__']],
                ['identifier', 'init']],
                ['identifier', 'apply']],
                [['identifier', 'self'], ['identifier', 'arguments']]
            ])
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
