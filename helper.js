exports.gcd = function(list) {
    if (list.length == 0) return 1

    var gcdInner = function(a, b) {
        if (!b) return a
        return gcdInner(b, a % b)
    }
    return gcdInner(list[0], exports.gcd(list.slice(1)))
}

exports.offsetToLinePos = function(offset, input) {
    var lines = input.split('\n').map(function(x) { return x + '\n' })

    var navigate = function(pos, step) {
        var line = pos[0], char = pos[1]

        if (char + step >= 0 && char + step < lines[line].length) {
            return [line, char + step]
        } else if (char + step < 0 && line > 0) {
            return navigate([line - 1, lines[line - 1].length - 1], char + step + 1)
        } else if (char + step >= lines[line].length && line + 1 < lines.length) {
            return navigate([line + 1, 0], char + step - lines[line].length)
        }
    }

    var pos = navigate([0, 0], offset, lines)
    pos[0]++
    pos[1]++
    return pos
}

exports.getIndent = function(input) {
    var useTabs = null
    var indents = input.split('\n').filter(function(x) {
        return x.trim() != ''
    }).map(function(x, i) {
        var whitespace = /^\s*/.exec(x)[0]

        if (whitespace.length != 0) {
            var tabs = whitespace.indexOf('\t') != -1
            if (useTabs === null) useTabs = tabs
            else if (useTabs != tabs) throw { line: i }
        }

        return whitespace.length
    })

    var indentDiffs = []

    for (var i = 1; i < indents.length; i++)
        indentDiffs.push(Math.abs(indents[i] - indents[i - 1]))

    return exports.gcd(indentDiffs)
}

exports.removeStringComments = function(input) {
    var commentsRemoved = ''
    var pureCode = ''
    var comments = []
    var offset = 0

    var rules = {
        doublestring: /^"("|[^]*?[^\\]")/,
        singlestring: /^'('|[^]*?[^\\]')/,
        singlecomment: /^\/\/.*/,
        blockcomment: /^\/\*[^]*?\*\//,
        others: /^([^"'\/]+|\/[^\/\*][^"'\/]*)+/
    }

    while (input.length > 0) {
        var type = ''
        var value = ' '
        var length = 1

        for (var t in rules) {
            var matches = rules[t].exec(input)
            if (!matches) continue

            type = t
            value = matches[0]
            length = value.length
            break
        }

        if (type.indexOf('string') != -1 || type.indexOf('comment') != -1) {
            var diff = ''
            for (var i = 0; i < value.length; i++)
                diff += value[i] == '\n' ? '\n' : ' '

            if (type.indexOf('comment') != -1)
                commentsRemoved += diff
            pureCode += diff
        } else {
            pureCode += value
        }

        if (type.indexOf('comment') == -1) {
            commentsRemoved += value
        } else {
            // Add comment to comments
            comments.push([value, offset])
        }

        input = input.substr(length)
        offset += length
    }

    return [commentsRemoved, pureCode, comments]
}

exports.indentifizer = function(input, pureCode, indentLength) {
    input = input.split('\n')
    pureCode = pureCode.split('\n')

    var depth = 0
    var lastIndex = 0
    var indentDepths = []

    for (var i = 0; i < input.length; i++) {
        if (pureCode[i].trim() == '') continue
        var linedepth = /^\s*/.exec(input[i])[0].length / indentLength

        if (i != 0) {
            if (linedepth > depth) {
                var trimmed = pureCode[lastIndex].trim()

                if (trimmed[trimmed.length - 1] == ':') {
                    input[lastIndex] += ' #INDENT'
                    indentDepths.push(depth)
                }
            }

            for (var j = 0; j < depth - linedepth; j++) {
                if (indentDepths[indentDepths.length - 1] == depth - j - 1) {
                    input[lastIndex] += ' #DEINDENT'
                    indentDepths.splice(indentDepths.length - 1, 1)
                }
            }
        }

        depth = linedepth
        lastIndex = i
    }

    input = input.join('\n')

    for (var i = 0; i < indentDepths.length; i++)
         input += ' #DEINDENT'

    return input
}
