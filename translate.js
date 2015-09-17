module.exports = function(tree, indent) {
    if (!indent) indent = '    '

    exports.indent = indent
    exports.identifiers = getIdentifiers(tree)
    exports.flags = {}

    return statements(tree, 0)
}

// Helper functions

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
    if (exports.identifiers.indexOf(base) == -1) {
        exports.identifiers.push(base)
        return base
    }

    var counter = 1
    while (exports.identifiers.indexOf(base + counter) != -1)
        counter++

    exports.identifiers.push(base + counter)
    return base + counter
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
        return x !== null
    }).map(function(x) {
        if (typeof x == 'string')
            return x

        return formatCode(x).split('\n').map(function(y) {
            return exports.indent + y
        }).join('\n')
    }).join('\n')
}

function paren(tree) {
    if (['.', '?.', '()', '?()', '[]', '?[]', 'bool', 'number', 'number', 'keyword', 'identifier', 'array', 'object', 'string', '^', '%', 'chaincmp', '??'].indexOf(tree[0]) != -1)
        return expression(tree)
    return '(' + expression(tree) + ')'
}

// Translator functions

function statements(tree, depth) {
    var statements = []

    for (var i = 1; i < tree.length; i++) {
        statements.push(statement(tree[i]) + ';')
    }

    return formatCode(statements).split('\n').map(function(x) {
        for (var i = 0; i < depth; i++)
            x = exports.indent + x
        return x
    }).join('\n')
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
    }

    return expression(tree)
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
    console.dir(s)
    return expression(['()', ['function', null, [], s], []])
}

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

function array(tree) {
    var temp = getVarName('r')

    if (tree[0] != 'arrayfor') {
        return '[' + tree.slice(1).map(function(x) {
            return expression(x)
        }).join(', ') + ']'
    } else {
        return formatCode([
            '(function() {', [
                expression(['=', ['identifier', temp], ['array']]),
                forHead(tree[1]), [
                    temp + '.push(' + expression(tree[1][4]) + ');'
                ], '}',
                'return ' + temp + ';'
            ], '})()'
        ])
    }
}

function object(tree) {
    if (tree[0] != 'objectfor') {
        return formatCode([
            '{',
            tree.slice(1).map(function(x, i) {
                return expression(x[0]) + ': ' + expression(x[1])
                    + (i == tree.length - 2 ? '' : ',')
            }),
            '}'
        ])
    } else {
        var key = expression(tree[1][4][0])
        var value = expression(tree[1][4][1])
        var temp = getVarName('r')

        return formatCode([
            '(function() {', [
                expression(['=', ['identifier', temp], ['object']]),
                forHead(tree[1]), [
                    temp + '[' + key + '] = ' + value + ';'
                ], '}',
                'return ' + temp + ';'
            ], '})()'
        ])
    }
}

function range(tree) {
    var temp = ['identifier', getVarName('i')]
    return array(['arrayfor', ['for', [temp, null], tree, null, temp]])
}

function func(tree) {
    var output = funcHead(tree)
    output += statements(tree[3], 1) + '\n}'
    return output
}

function funcHead(tree) {
    var identifier = tree[1] ? expression(tree[1]) : null
    var funcargs = tree[2].map(function(x) {
        return [expression(x[0]), x[1]]
    })
    var hasOptionalArgs = funcargs.some(function(x) {
        return x[1] !== null
    })
    var spreadindex = funcargs.map(function(x) { return x[1] }).indexOf('*')
    if (spreadindex == -1) spreadindex = funcargs.length

    var output = (identifier ? identifier + ' = ' : '') + 'function('

    if (!hasOptionalArgs) output += funcargs.map(function(x) {
        return x[0]
    }).join(', ')

    output += ') {\n'

    if (hasOptionalArgs) {
        for (var i = 0; i < spreadindex; i++) {
            output += exports.indent + 'var ' + funcargs[i][0] + ' = '
            if (!funcargs[i][1])
                output += 'arguments[' + i + '];\n'
            else
                output += 'typeof arguments[' + i + '] === "undefined" ? ' + expression(funcargs[i][1]) + ' : arguments[' + i + '];\n'
        }

        if (spreadindex == funcargs.length - 1) {
            output += exports.indent
                + 'var ' + funcargs[spreadindex][0] + ' = '
                + spreadindex + ' >= arguments.length ? [] : '
                + 'arguments.slice(' + spreadindex + ');\n'
        } else if (spreadindex < funcargs.length - 1) {
            var afterspreadcount = funcargs.length - 1 - spreadindex

            output += exports.indent
                + 'var ' + funcargs[spreadindex][0] + ' = '
                + spreadindex + ' >= arguments.length - ' + afterspreadcount + ' ? [] : '
                + 'arguments.slice(' + spreadindex + ', -' + afterspreadcount + ');\n'
        }

        for (var i = funcargs.length - 1; i > spreadindex; i--) {
            output += exports.indent + 'var ' + funcargs[i][0] + ' = '
            if (!funcargs[i][1])
                output += 'arguments[arguments.length - ' + (funcargs.length - i) + '];\n'
            else
                output += 'typeof arguments[arguments.length - ' + (funcargs.length - i) + '] === "undefined" ? ' + expression(funcargs[i][1]) + ' : arguments[arguments.length - ' + (funcargs.length - i) + '];\n'
        }
    }

    return output
}

function lambda(tree) {
    return func([
        'function', null, tree[2],
        ['statements', ['keyword', 'return', tree[3]]]
    ])
}

function funcCall(tree) {
    var output = ''
    var placeholderCount = tree[2].filter(function(x) {
        return x[0] == 'keyword' && x[1] == '_'
    }).length

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

function forHead(tree) {
    var firstIdentifier = expression(tree[1][0])
    var secondIdentifier = tree[1][1] ? expression(tree[1][1]) : null
    var identifierCount = tree[1][1] ? 2 : 1
    var output = ''

    if (tree[2][0] == 'range') {
        var r = tree[2]
        var starttemp = getVarName('start')
        var endtemp = getVarName('end')
        var steptemp = getVarName('step')

        var start = expression(r[1])
        var end = r[3] ? expression(r[3]) : null
        var step = (function() {
            if (r[2]) return paren(r[2]) + ' - ' + starttemp
            if (end) return endtemp + ' === ' + starttemp + ' ? 1 : ' + 'Math.sign(' + endtemp + ' - ' + starttemp + ')'
            return '1'
        })()

        var code = formatCode([
            'var ' + starttemp + ' = ' + start + ';',
            end ? 'var ' + endtemp + ' = ' + end + ';' : null,
            'var ' + steptemp + ' = ' + step + ';'
        ])

        if (!secondIdentifier) {
            output = formatCode([
                code,
                'for (var ' + firstIdentifier + ' = ' + starttemp + '; '
                    + (end ? firstIdentifier + ' <= ' + endtemp : 'true') + '; '
                    + firstIdentifier + ' += ' + steptemp + ') {'
            ])
        } else {
            output = formatCode([
                code,
                'for (var ' + secondIdentifier + ' = ' + starttemp + ', ' + firstIdentifier + ' = 0; '
                    + (end ? secondIdentifier + ' <= ' + endtemp : 'true') + '; '
                    + secondIdentifier + ' += ' + steptemp + ', ' + firstIdentifier + '++) {'
            ])
        }
    } else if (identifierCount == 1) {
        exports.flags.enumerate = true
        var listtemp = getVarName('list')
        var itemp = getVarName('i')

        output = formatCode([
            'var ' + listtemp + ' = _.enumerate(' + expression(tree[2]) + ')',
            'for (var ' + itemp + ' = 0; ' + itemp + ' < ' + listtemp + '.length; ' + itemp + '++) {', [
                'var ' + firstIdentifier + ' = ' + listtemp + '.get(' + itemp + ');'
            ]
        ])
    } else {
        exports.flags.enumerateKeys = true
        var listtemp = getVarName('list')
        var keystemp = getVarName('keys')
        var itemp = getVarName('i')

        output = formatCode([
            'var ' + listtemp + ' = ' + expression(tree[2]) + ';',
            'var ' + keystemp + ' = _.enumerateKeys(' + listtemp + ');',
            'for (var ' + itemp + ' = 0; ' + itemp + ' < ' + keystemp + '.length; ' + itemp + '++) {', [
                'var ' + firstIdentifier + ' = ' + keystemp + '.get(' + itemp + ');',
                'var ' + secondIdentifier + ' = ' + listtemp + '[' + firstIdentifier + '];'
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
    return formatCode([
        forHead(tree), [
            statements(tree[4])
        ], '}'
    ])
}

function whileStatement(tree) {
    return formatCode([
        'while (' + expression(tree[1]) + ') {', [
            statements(tree[2])
        ], '}'
    ])
}

function ifStatement(tree) {
    var output = formatCode([
        'if (' + expression(tree[1][0]) + ') {', [
            statements(tree[1][1])
        ], '}'
    ])

    for (var i = 2; i < tree.length; i++) {
        output += formatCode([
            tree[i][0] == 'else'
            ? ' else {'
            : ' else if (' + expression(tree[i][0]) + ') {', [
                statements(tree[i][1])
            ], '}'
        ])
    }

    return output
}

function tryStatement(tree) {
    var output = formatCode([
        'try {', [
            statements(tree[1])
        ], '}'
    ])

    if (tree[2] != null) {
        output += formatCode([
            ' catch (' + expression(tree[2][0]) + ') {', [
                statements(tree[2][1])
            ], '}'
        ])
    } else {
        var temp = getVarName('e')
        output += ' catch(' + temp + ') {}'
    }

    if (tree[3] != null) {
        output += formatCode([
            ' finally {', [
                statements(tree[3])
            ], '}'
        ])
    }

    return output
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
