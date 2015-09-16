var process = require('process')
var fs = require('fs')
var nearley = require('nearley')
var grammar = require('./grammar')
var helper = require('./helper')

var filename = process.argv[2]
var data = fs.readFileSync(filename, 'utf8')

// Normalize endings

console.error('Normalize endings...')
data = data.replace(/\r\n/g, '\n').replace(/\r/g, '')

// Remove comments & strings

console.error('Remove comments...')

var removed = helper.removeStringComments(data)
var pureCode = removed[1]
var comments = removed[2]
data = removed[0]
console.log(comments)

// Get indent length

console.error('Determine indent length...')
var indentLength

try {
    indentLength = helper.getIndent(data)
} catch(e) {
    console.error('Mixed indentation @' + e.line + ':1')
    return
}

// Indentifizer

console.error('Indentifizer...')
data = helper.indentifizer(data, pureCode, indentLength)

// Invoke nearley

console.error('Parsing...')
var p = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)

try {
    var result = p.feed(data)

    if (!result || !result.results || !result.results.length) {
        throw { message: 'Unexpected end', offset: data.length - 1 }
    }
} catch(e) {
    var pos = helper.offsetToLinePos(e.offset, data)
    var message = e.message
    if (message.indexOf('nearley') != -1) message = 'Parse error'

    console.error(message + ' @' + pos[0] + ':' + pos[1])
    return
}

console.error('Compiled.')
console.error(result.results.length == 1 ? 'No ambiguity detected.' : 'Ambiguity detected.')
console.dir(result.results, { depth: null })
