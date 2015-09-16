module.exports = function(tree, indent) {
    if (!indent) indent = '    '
    exports.indent = indent
    return statements(tree, 0)
}

function statements(tree, depth) {
    var statements = []

    for (var i = 1; i < tree.length; i++) {
        statements.push(statement(tree[i]))
    }

    return statements.map(function(x) {
        for (var i = 0; i < depth; i++) x = exports.indent + x
        return x
    }).join(';\n')
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
    } else if (tree[0] == 'function') {
        return func(tree)
    } else if (tree[0] == '=' || tree[0].length == 2 && tree[0][1] == '=') {
        return expression(tree[1]) + ' ' + tree[0] + ' ' + expression(tree[2])
    }

    return '/* ... */'
}

function func(tree) {
    var identifier = tree[1]

    var r = (identifier ? identifier + ' = ' : '') + 'function('
    r += argsdefinition(tree[2]) + ') {\n'
    r += statements(tree[3], 1) + '\n}'

    return r
}

function argsdefinition(tree) {
    return '/* ... */'
}
