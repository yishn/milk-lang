module.exports = function(tree, indent) {
    if (!indent) indent = '    '
    exports.indent = indent
    exports.underscoreKeys = []
    exports.flags = {}
    return statements(tree, 0)
}

function getVarName(base) {
    if (exports.underscoreKeys.indexOf(base) == -1) {
        exports.underscoreKeys.push(base)
        return base
    }

    var counter = 1
    while (exports.underscoreKeys.indexOf(base + counter) != -1)
        counter++

    exports.underscoreKeys.push(base + counter)
    return base + counter
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

function statements(tree, depth) {
    var statements = []

    for (var i = 1; i < tree.length; i++) {
        statements.push(statement(tree[i]).split('\n').map(function(y) {
            for (var i = 0; i < depth; i++)
                y = exports.indent + y
            return y
        }).join('\n'))
    }

    return statements.join(';\n') + ';'
}

function statement(tree) {
    if (tree[0] == 'keyword') {
        if (tree[1] == 'pass') return ''
        return tree[1] + (tree[2] ? ' ' + expression(tree[2]) : '')
    } else if (tree[0] == 'expression') {
        return expression(tree[1])
    }

    return '/* ... */'
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
    } else if (tree[0] == '=' || tree[0].length == 2 && tree[0][1] == '=') {
        return expression(tree[1]) + ' ' + tree[0] + ' ' + expression(tree[2])
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
    } else if (['<=', '>=', '<', '>', '==', '!=', '+', '-', '*', '/', 'instanceof'].indexOf(tree[0]) != -1 && tree.length == 3) {
        return [paren(tree[1]), tree[0], paren(tree[2])].join(' ')
    } else if (tree[0] == '%') {
        exports.flags.modulo = true
        return '_.modulo(' + expression(tree[1]) + ', ' + expression(tree[2]) + ')'
    } else if (tree[0] == '^') {
        return 'Math.pow(' + expression(tree[1]) + ', ' + expression(tree[2]) + ')'
    } else if (tree[0] == 'in' || tree[0] == 'not in') {
        exports.flags.inOperator = true
        var output = '_.inOp(' + expression(tree[1]) + ', ' + expression(tree[2]) + ')'
        return tree[0] == 'in' ? output : '!' + output
    } else if (['+', '-', '++_', '--_', 'typeof', 'new'].indexOf(tree[0]) != -1) {
        var op = ['new', 'typeof'].indexOf(tree[0]) != -1 ? tree[0] + ' ' : tree[0].replace('_', '')
        return op + paren(tree[1])
    } else if (tree[0] == '_++' || tree[0] == '_--') {
        return paren(tree[1]) + tree[0].substr(1)
    } else if (tree[0] == '.') {
        return expression(tree[1]) + '.' + expression(tree[2])
    } else if (tree[0] == '?.') {
        var temp = '_.' + getVarName('r')
        return formatCode([
            '(function() {', [
                temp + ' = ' + expression(tree[1]) + ';',
                'if (typeof ' + temp + ' === "undefined" || ' + temp + ' === null)', [
                    'return null;'
                ], 'else return ' + temp + '.' + expression(tree[1]) + ';'
            ], '})()'
        ])
    }

    return '/* ... */'
}

function existentialOp(tree) {
    var temp = '_.' + getVarName('r')
    return formatCode([
        '(function() {', [
            temp + ' = ' + expression(tree[1]) + ';',
            'if (typeof ' + temp +' === "undefined" || ' + temp +' === null)', [
                'return ' + expression(tree[2]) + ';'
            ], 'else return ' + temp + ';'
        ], '})()'
    ])
}

function chainCmp(tree) {
    var temps = []
    var varDeclaration = tree.filter(function(x, i) {
        return i % 2 != 0
    }).map(function(x, i) {
        var temp = '_.' + getVarName('r' + (i + 1))
        temps.push(temp)
        return temp + ' = ' + expression(x) + ';'
    })

    var chained = []
    for (var i = 3; i < tree.length; i += 2) {
        chained.push(temps[(i - 1) / 2 - 1] + ' ' + tree[i - 1] + ' ' + temps[(i + 1) / 2 - 1])
    }

    return formatCode([
        '(function() {',
            varDeclaration, [
            'return ' + chained.join(' && ') + ';'
        ], '})()'
    ])
}

function array(tree) {
    var temp = '_.' + getVarName('r')

    if (tree[0] != 'arrayfor') {
        return '[' + tree.slice(1).map(function(x) {
            return expression(x)
        }).join(', ') + ']'
    } else {
        return formatCode([
            '(function() {', [
                temp + ' = [];',
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
        var temp = '_.' + getVarName('r')

        return formatCode([
            '(function() {', [
                temp + ' = {};',
                forHead(tree[1]), [
                    temp + '[' + key + '] = ' + value + ';'
                ], '}',
                'return ' + temp + ';'
            ], '})()'
        ])
    }
}

function func(tree) {
    var output = funcHead(tree)
    output += statements(tree[3], 1) + '\n}'
    return output
}

function funcHead(tree) {
    var identifier = tree[1]
    var funcargs = tree[2]
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
    return funcHead(tree) + exports.indent + 'return ' + expression(tree[3]) + ';\n}'
}

function forHead(tree) {
    var firstIdentifier = tree[1][0]
    var secondIdentifier = tree[1][1]
    var identifierCount = tree[1][1] ? 2 : 1
    var output = ''

    if (tree[2][0] == 'range') {
        var r = tree[2]
        var start = r[1] ? expression(r[1]) : '0'
        var end = r[3] ? expression(r[3]) : null
        var step = (function() {
            if (r[2]) return '(' + expression(r[2]) + ') - start'
            if (end) return 'Math.sign(_.end - _.start)'
            return '1'
        })()
        var starttemp = '_.' + getVarName('start')
        var endtemp = '_.' + getVarName('end')
        var steptemp = '_.' + getVarName('step')

        output = formatCode([
            starttemp + ' = ' + start + ';',
            end ? endtemp + ' = ' + end + ';' : null,
            steptemp + ' = ' + step + ';',
            'for (var ' + firstIdentifier + ' = ' + starttemp + '; '
            + (end ? firstIdentifier + ' <= ' + endtemp : 'true') + '; '
            + firstIdentifier + ' += ' + steptemp + ') {', [
                secondIdentifier ? secondIdentifier + ' = ' + firstIdentifier : null
            ]
        ])
    } else if (identifierCount == 1) {
        exports.flags.forHead = true
        var listtemp = '_.' + getVarName('list')
        var itemp = '_.' + getVarName('i')

        output = formatCode([
            listtemp + ' = _.enumerate(' + expression(tree[2]) + ')',
            'for (' + itemp + ' = 0; ' + itemp + ' < ' + listtemp + '.length; ' + itemp + '++) {', [
                'var ' + firstIdentifier + ' = ' + listtemp + '.get(' + itemp + ');'
            ]
        ])
    } else {
        exports.flags.forHead = true
        var listtemp = '_.' + getVarName('list')
        var keystemp = '_.' + getVarName('keys')
        var itemp = '_.' + getVarName('i')

        output = formatCode([
            listtemp + ' = ' + expression(tree[2]) + ';',
            keystemp + ' = _.enumerateKeys(' + listtemp + ');',
            'for (' + itemp + ' = 0; ' + itemp + ' < ' + keystemp + '.length; ' + itemp + '++) {', [
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
