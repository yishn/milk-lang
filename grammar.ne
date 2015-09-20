# Statements

       statementList -> _ statement __
                        {% function(d) { return ['statements', d[1]] } %}
                      | statementList [;\n] __
                        {% id %}
                      | statementList [;\n] __ statement __
                        {% function(d) { return d[3] ? d[0].concat([d[3]]) : d[0] } %}

      flatStatements -> __ statement
                        {% function(d) { return ['statements', d[1]] } %}
                      | flatStatements __ ";"
                        {% id %}
                      | flatStatements __ ";" __ statement
                        {% function(d) { return d[3] ? d[0].concat([d[3]]) : d[0] } %}

           statement -> (class | keywordStatement | condStatement | tryStatement | loop)
                        {% function(d, l) {
                            var r = d[0][0]
                            r.offset = l
                            return r
                        } %}
                      | expression
                        {% function(d, l) {
                            var r = d[0]
                            r.offset = l
                            return r
                        } %}

    keywordStatement -> ("break" | "continue" | "pass")
                        {% function(d) { return ['keyword', d[0][0]] } %}
                      | ("return") (_+ expression):?
                        {% function(d) { return ['keyword', d[0][0], d[1] ? d[1][1] : null] } %}
                      | ("throw" | "delete") _+ memberAccess
                        {% function(d) { return ['keyword', d[0][0], d[2]] } %}

               block -> ":" _ "#INDENT" __ "\n" statementList "#DEINDENT"
                        {% function(d) { return d[5] } %}
                      | ":" flatStatements
                        {% function(d) { return d[1] } %}

# Expressions

    expression -> assignment
                  {% id %}

   parenthesis -> "(" _ expression _ ")"
                  {% function(d) { return d[2] } %}
                | entity
                  {% id %}

  memberAccess -> memberAccess _ ("." | "?.") identifier
                  {% function(d) { return [d[2][0], d[0], d[3]] } %}
                | memberAccess ("[" | "?[") _ expression _ "]"
                  {% function(d) { return [d[1][0] + ']', d[0], d[3]] } %}
                | memberAccess "?":? range
                  {% function(d) { return [d[1] ? '?[]' : '[]', d[0], d[2]] } %}
                | memberAccess "?":? callList ")"
                  {% function(d) { return [d[1] ? '?()' : '()', d[0], d[2]] } %}
                | parenthesis
                  {% id %}

   keywordExpr -> "new" _+ memberAccess
                  {% function(d) { return ['new', d[2]] } %}
                | memberAccess
                  {% id %}

   postfixIncr -> keywordExpr _ ("++" | "--")
                  {% function(d) { return ['_' + d[2][0], d[0]] } %}
                | keywordExpr
                  {% id %}

       wedgeOp -> postfixIncr _ "^" _ wedgeOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | postfixIncr
                  {% id %}

         unary -> [+-] wedgeOp
                  {% function(d) { return [d[0], d[1]] } %}
                | ("++" | "--") _ wedgeOp
                  {% function(d) { return [d[0][0] + '_', d[2]] } %}
                | "typeof" _+ wedgeOp
                  {% function(d) { return [d[0], d[2]] } %}
                | wedgeOp
                  {% id %}

        starOp -> starOp _ [*/%] __ unary
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | unary
                  {% id %}

        plusOp -> plusOp _ [+-] _+ starOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | starOp
                  {% id %}

    comparison -> plusOp _ cmpOperator _ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | plusOp _+ ("in" | "instanceof" | "not in") _+ memberAccess
                  {% function(d) { return [d[2][0], d[0], d[4]] } %}
                | chainedCmp
                  {% id %}
                | plusOp
                  {% id %}

   cmpOperator -> ("<=" | ">=" | [<>] | "==" | "!=")
                  {% function(d) { return d[0][0] } %}
                | ([\s] "equals" [\s] | [\s] "not equals" [\s])
                  {% function(d) { return d[0][1] } %}

    chainedCmp -> plusOp _ cmpOperator _ plusOp (_ cmpOperator _ plusOp):+
                  {% function(d) {
                      var r = ['chaincmp', d[0], d[2], d[4]]
                      d[5].forEach(function(x) {
                           r.push(x[1], x[3])
                      })
                      return r
                  } %}

       boolNot -> "not" _+ comparison
                  {% function(d) { return ['not', d[2]] } %}
                | comparison
                  {% id %}

       boolAnd -> boolAnd _+ "and" _+ boolNot
                  {% function(d) { return ['and', d[0], d[4]] } %}
                | boolNot
                  {% id %}

       boolOr -> boolOr _+ "or" _+ boolAnd
                  {% function(d) { return ['or', d[0], d[4]] } %}
                | boolAnd
                  {% id %}

   existential -> memberAccess _ "??" _ existential
                  {% function(d, l) { return ['??', d[0], d[4]] } %}
                | boolOr
                  {% id %}

      inlineIf -> existential _ "?" _ inlineIf _ ":" (_ "#INDENT"):? _ inlineIf (_ "#DEINDENT"):?
                  {% function(d) { return ['?', d[0], d[4], d[9]] } %}
                | existential
                  {% id %}

        lambda -> arguments ")" _ "=>" _ lambda
                  {% function(d) { return ['lambda', null, d[0], d[5]] } %}
                | identifier _ "=>" _ lambda
                  {% function(d) { return ['lambda', null, [[d[0], null]], d[4]] } %}
                | inlineIf
                  {% id %}

    assignment -> assignee _ [+\-*^/%] "=" _ assignment
                  {% function(d) { return [d[2] + d[3], d[0], d[5]] } %}
                | patternmatch
                  {% id %}
                | lambda
                  {% id %}

      assignee -> memberAccess
                  {% function(d, _, r) {
                      var list = ['number', 'string', 'object',
                          'array', 'bool', 'range',
                          'func', 'keyword', '()', '?()']
                      return list.indexOf(d[0][0]) != -1 ? r : d[0]
                  } %}

# Pattern matching

        patternmatch -> pattern _ "=" _ assignment
                        {% function(d) { return ['=', d[0], d[4]] } %}

             pattern -> (assignee | arraypattern | objpattern)
                        {% function(d) { return d[0][0] } %}
                      | "_"
                        {% function(d) { return ['keyword', '_'] } %}

        arraypattern -> "[" _ pattern __ ([,\n] _ pattern __):* [,\n] _ spread __ ([,\n] _ pattern __):* "]"
                        {% function(d) {
                            var r = ['arraypattern', d[2]].concat(d[4].map(function(x) {
                                return x[2]
                            }))
                            r.push(d[7])
                            r.push.apply(r, d[9].map(function(x) {
                                return x[2]
                            }))
                            return r
                        } %}
                      | "[" ((_ pattern __ [,\n]):* _ spread __ [,\n]):? _ pattern __ ([,\n] _ pattern __):* "]"
                        {% function(d) {
                            var r = ['arraypattern']
                            if (d[1] != null) {
                                r = r.concat(d[1][0].map(function(x) {
                                    return x[1]
                                }).concat([d[1][2]]))
                            }

                            r.push(d[3])
                            r.push.apply(r, d[5].map(function(x) {
                                return x[2]
                            }))
                            return r
                        } %}

              spread -> "*" pattern
                        {% function(d) { return ['spread', d[1]] } %}
                      | "..."
                        {% function(d) { return ['spread', ['keyword', '_']] } %}

          objpattern -> "{" objpatternList "}"
                        {% function(d) { return ['objpattern'].concat(d[1]) } %}

      objpatternList -> (_ objpatternItem __ [,\n]):* _ objpatternItem __ ([,\n] _):?
                        {% function(d) { return d[0].map(function(x) { return x[1] }).concat([d[2]]) } %}

      objpatternItem -> expression _ ":" (_ "#INDENT"):? _ pattern (_ "#DEINDENT"):?
                        {% function(d) { return [d[0], d[5]] } %}
                      | identifier
                        {% function(d) { return [d[0], d[0]] } %}

# Values

         literal -> (bool | number | string | regex | array | range | object | func)
                    {% function(d) { return d[0][0] } %}

          entity -> (keywordEntity | identifier | literal)
                    {% function(d) { return d[0][0] } %}

   keywordEntity -> ("null" | "this" | "self" | "super" | "debugger" | "void" | "arguments")
                    {% function(d) { return ['keyword', d[0][0]] } %}

            bool -> ("true" | "false")
                    {% function(d) { return ['bool', d[0][0]] } %}

             int -> [0-9]:+
                    {% function(d) { return ['number', parseInt(d[0].join(''), 10)] } %}

          number -> int
                    {% id %}
                  | int:? "." int
                    {% function(d) { return ['number', parseFloat((d[0] ? d[0][1] : '') + '.' + d[2][1])] } %}
                  | "0x" [0-9a-fA-F]:+
                    {% function(d) { return ['number', parseInt(d[0] + d[1].join(''), 16)] } %}

      identifier -> [a-zA-Z_$] [0-9a-zA-Z_$]:*
                    {% function(d, _, r) {
                        var keywords = [
                            '_', 'pass', "equals",
                            'null', 'undefined', 'and', 'or', 'not', 'true', 'false', 'arguments',
                            'export', 'import', 'void', 'debugger', 'with',
                            'delete', 'var', 'let', 'const', 'typeof',
                            'new', 'class', 'extends', 'this', 'self', 'super',
                            'return', 'yield', 'function',
                            'if', 'else',
                            'switch', 'case', 'default',
                            'do', 'while', 'break', 'continue',
                            'for', 'in', 'of', 'instanceof',
                            'try', 'catch', 'finally', 'throw',

                            'enum', 'implements', 'static', 'public', 'package',
                            'interface', 'protected', 'private', 'abstract', 'final',
                            'native', 'boolean', 'float', 'short', 'byte',
                            'goto', 'synchronized', 'char', 'int', 'transient', 'double',
                            'long', 'volatile'
                        ]
                        var id = d[0] + d[1].join('')
                        if (keywords.indexOf(id) != -1) return r
                        return ['identifier', id]
                    } %}

          string -> stringBeg1 "\""
                    {% function(d) { return ['string', d[0] + d[1]] } %}
                  | stringBeg2 "'"
                    {% function(d) { return ['string', d[0] + d[1]] } %}

      stringBeg1 -> "\""
                    {% id %}
                  | stringBeg1 [^"\\] #"
                    {% function(d) { return d.join('') } %}
                  | stringBeg1 "\\" [^\n]
                    {% function(d) { return d.join('') } %}

      stringBeg2 -> "'"
                    {% id %}
                  | stringBeg2 [^'\\] #'
                    {% function(d) { return d.join('') } %}
                  | stringBeg2 "\\" [^\n]
                    {% function(d) { return d.join('') } %}

           regex -> regexBeg "/" [gim]:*
                    {% function(d) { return ['regex', d[0] + '/' + d[2].join('')] } %}

        regexBeg -> "/" [^/\n]
                    {% function(d) { return d.join('') } %}
                  | regexBeg [^/\n]
                    {% function(d) { return d.join('') } %}
                  | regexBeg "\\" [.]
                    {% function(d) { return d.join('') } %}

           array -> (arrayList | "[") __ ([,\n] _):? "]"
                    {% function(d) { return ['array'].concat(d[0][0] != '[' ? d[0][0] : []) } %}
                  | "[" _ expression _+ forHead _ "]"
                    {% function(d) { return ['arrayfor', d[4].concat([d[2]])] } %}

       arrayList -> "[" _ expression
                    {% function(d) { return [d[2]] } %}
                  | arrayList __ [,\n] _ expression
                    {% function(d) { return d[0].concat([d[4]]) } %}

           range -> "[" _ expression _ ("," _):? "..." _ ("," _):? (expression _):? "]"
                    {% function(d) { return ['range', d[2], null, d[8] ? d[8][0] : null] } %}
                  | "[" _ expression _ "," _ expression _ ("," _):? "..." _ ("," _):? (expression _):? "]"
                    {% function(d) { return ['range', d[2], d[6], d[12] ? d[12][0] : null] } %}

          object -> "{" objectList "}"
                    {% function(d) { return ['object'].concat(d[1]) } %}
                  | "{" _ objectListItem _+ forHead _ "}"
                    {% function(d) { return ['objectfor', d[4].concat([d[2]])] } %}

      objectList -> null
                    {% function(d) { return [] } %}
                  | (_ objectListItem __ [,\n]):* _ objectListItem __ ([,\n] _):?
                    {% function(d) { return d[0].map(function(x) { return x[1] }).concat([d[2]]) } %}

  objectListItem -> expression _ ":" (_ "#INDENT"):? _ expression (_ "#DEINDENT"):?
                    {% function(d) { return [d[0], d[5]] } %}

# Functions

                func -> "function" (_+ identifier):? _ arguments ")" _ block
                        {% function(d) { return ['function', d[1] ? d[1][1] : null, d[3], d[6]] } %}

           arguments -> (nonemptyArguments | emptyArguments)
                        {% function(d) { return d[0][0] } %}

      emptyArguments -> emptyCallList
                        {% id %}

   nonemptyArguments -> "(" _ argument _
                        {% function(d) { return [d[2]] } %}
                      | arguments "," _ argument _
                        {% function(d) { return d[0].concat([d[3]]) } %}

            argument -> identifier
                        {% function(d) { return [d[0], null] } %}
                      | identifier _ "=" _ expression
                        {% function(d) { return [d[0], d[4]] } %}
                      | "*" identifier
                        {% function(d) { return [['spread', d[1]], null] } %}

            callList -> (nonemptyCallList | emptyCallList)
                        {% function(d) { return d[0][0] } %}

       emptyCallList -> "(" _
                        {% function(d) { return [] } %}

    nonemptyCallList -> "(" _ callListItem
                        {% function(d) { return [d[2]] } %}
                      | callList _ "," _ callListItem
                        {% function(d) { return d[0].concat([d[4]]) } %}

        callListItem -> expression
                        {% id %}
                      | "_"
                        {% function(d) { return ['keyword', '_'] } %}
                      | "*" expression
                        {% function(d) { return ['spread', d[1]] } %}
                      | "*_"
                        {% function(d) { return ['spread', ['keyword', '_']] } %}

# Classes

        class -> "class" _+ identifier (_+ "extends" _+ expression):? _ block
                 {% function(d) { return ['class', d[2], d[3] ? d[3][3] : null, d[5]] } %}

# Conditional statements

     condStatement -> ifStatement
                      {% id %}

       ifStatement -> "if" _+ expression _ block elifStatements
                      {% function(d) { return ['if', [d[2], d[4]]].concat(d[5]) } %}

    elifStatements -> (_ elifStatement):* elseStatement
                      {% function(d) {
                          var r = d[0].map(function(x) { return x[1] })
                          if (d[1] !== null) r.push(d[1])
                          return r
                      } %}

     elifStatement -> "else" __ "if" _+ expression _ block
                      {% function(d) { return [d[4], d[6]] } %}

     elseStatement -> (_ "else" _ block):?
                      {% function(d) { return d[0] ? ['else', d[0][3]] : null } %}

# Try statement

        tryStatement -> "try" _ block catchStatement
                        {% function(d) { return ['try', d[2]].concat(d[3]) } %}

      catchStatement -> (_ "catch" (_+ identifier):? _ block):? finallyStatement
                        {% function(d) { return [d[0] ? [d[0][2] ? d[0][2][1] : null, d[0][4]] : null, d[1]] } %}

    finallyStatement -> (_ "finally" _ block):?
                        {% function(d) { return d[0] ? d[0][3] : null } %}

# Loops

       loop -> (forLoop | whileLoop)
               {% function(d) { return d[0][0] } %}

    forLoop -> forHead _ block
               {% function(d) { return d[0].concat([d[2]]) } %}

    forHead -> "for" _+ identifier (_ "," _ identifier):? _+ "in" _+ memberAccess (_+ "if" _ expression):?
               {% function(d) { return ['for', [d[2], d[3] ? d[3][3] : null], d[7], d[8] ? d[8][3] : null] } %}

  whileLoop -> "while" _+ expression _ block
               {% function(d) { return ['while', d[2], d[4]] } %}

# Whitespace

     _ -> [\s]:*        {% function(d) { return null } %}
    _+ -> [\s]:+        {% function(d) { return null } %}
    __ -> [^\S\n]:*     {% function(d) { return null } %}
