var process = require('process')
var fs = require('fs')
var nearley = require('nearley')
var grammar = require('./grammar')
var helper = require('./helper')
var translator = require('./translator')

var filename = process.argv[2]
var data = fs.readFileSync(filename, 'utf8')

console.time('//')

// Normalize endings

console.error('Normalize endings...')
data = data.replace(/\r\n/g, '\n').replace(/\r/g, '')

// Extract comments & strings

console.error('Extract comments...')

var removed = helper.removeStringComments(data)
var pureCode = removed[1]
var comments = removed[2]
data = removed[0]

// Indentifizer

console.error('Indentifizer...')

try {
    data = helper.indentifizer(data, pureCode)
} catch(e) {
    console.error('Mixed indentation @' + e.line + ':1')
    return
}

// Parser

var src = data
console.error('Parsing...')
var p = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)

try {
    p.feed(data)

    if (!p.results || !p.results.length)
        throw { message: 'Unexpected end', offset: data.length - 1 }
} catch(e) {
    var pos = helper.offsetToLinePos(e.offset, data)
    var message = e.message
    if (message.indexOf('nearley') != -1) message = 'Parse error'

    console.error(message + ' @' + pos[0] + ':' + pos[1])
    return
}

console.error(p.results.length == 1 ? 'No ambiguity detected.' : 'Ambiguity detected.')

var tree = p.results[0]

// Translator

console.error('Translating...')
data = translator.translate(tree)

// Commentator

console.error('Commenting...')
data = helper.commentator(data, src, comments)

console.log(data)
console.log()
console.timeEnd('//')
