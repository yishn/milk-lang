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
        } else {
            return [lines.length - 1, lines[lines.length - 1].length - 1]
        }
    }

    var pos = navigate([0, 0], offset, lines)
    pos[0]++
    pos[1]++
    return pos
}

exports.getIndent = function(input) {
    var useTabs = null
    var indents = input.filter(function(x) {
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
    var residue = input
    var lineCounter = 1

    var rules = {
        doublestring: /^"("|[^]*?[^\\]"|[^]*?\\\\")/,
        singlestring: /^'('|[^]*?[^\\]'|[^]*?\\\\')/,
        regexstring: /^\/(.*?[^\\]\/|.*?\\\\\/)[gim]*/,
        singlecomment: /^\/\/.*/,
        blockcomment: /^\/\*[^]*?\*\//,
        purecode: /^[^"'\/]+/
    }

    while (residue.length > 0) {
        var type = 'purecode'
        var value = residue[0]
        var length = 1

        for (var t in rules) {
            var matches = rules[t].exec(residue)
            if (!matches) continue

            type = t
            value = matches[0]
            length = value.length
            break
        }

        if (type.indexOf('comment') != -1) {
            // Add comment to comments
            comments.push([value, lineCounter])
        }

        for (var i = 0; i < value.length; i++) {
            var space = ' '
            if (value[i] == '\n') {
                space = '\n'
                lineCounter++
            }

            if (type.indexOf('comment') != -1) commentsRemoved += space
            else commentsRemoved += value[i]

            if (type == 'purecode') pureCode += value[i]
            else pureCode += space
        }

        residue = residue.substr(length)
        offset += length
    }

    return [commentsRemoved, pureCode, comments]
}

exports.indentifizer = function(input, pureCode) {
    input = input.split('\n')
    pureCode = pureCode.split('\n')

    var indentLength = exports.getIndent(input)
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

    for (var i = 0; i < indentDepths.length; i++)
         input[lastIndex] += ' #DEINDENT'

    input = input.join('\n').replace(/\s*$/, '')
    return input
}

exports.commentator = function(input, src, comments) {
    var r = exports.removeStringComments(input)
    var pureCode = r[1]
    var lastReportedLine = -5

    pureCode = pureCode.split('\n')
    lines = input.split('\n')

    for (var i = 0; i < lines.length; i++) {
        var index = pureCode[i].search(/#OFFSET\d+$/)
        if (index == -1) continue

        var offset = parseInt(pureCode[i].substr(index + 7))
        var indent = pureCode[i].match(/^\s*/)[0]
        r = exports.offsetToLinePos(offset, src)

        var row = r[0], col = r[1]
        lines[i] = null

        if (comments.length > 0 && comments[0][1] <= row) {
            lines[i] = '\n' + indent + comments[0][0]
            comments.splice(0, 1)
        } else if (i - lastReportedLine >= 5) {
            lines[i] = indent + '/*@' + row + ':' + col + '*/'
            lastReportedLine = i
        }
    }

    return lines.filter(function(x) {
        return x !== null
    }).join('\n')
}
