var process = require('process')
var fs = require('fs')
var nearley = require('nearley')
var grammar = require('./grammar')

var p = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)
var filename = process.argv[2]
var data = fs.readFileSync(filename, 'utf8')

data = data.trim()

var result = p.feed(data)

console.log(result.results.length)
console.dir(result.results, {
    depth: null
})
