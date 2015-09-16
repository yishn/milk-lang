# Statements

       statementList -> _ statement __
                        {% function(d, l) { return ['statements', d[1]] } %}
                      | statementList [;\n] __
                        {% id %}
                      | statementList [;\n] __ statement __
                        {% function(d, l) { return d[3] ? d[0].concat([d[3]]) : d[0] } %}

      flatStatements -> __ statement __
                        {% function(d, l) { return ['statements', d[1]] } %}
                      | flatStatements ";" __
                        {% id %}
                      | flatStatements ";" __ statement __
                        {% function(d, l) { return d[3] ? d[0].concat([d[3]]) : d[0] } %}

        functionList -> _ (func | passStatement) __
                        {% function(d, l) { return ['functions', d[1][0]] } %}
                      | functionList [;\n] __
                        {% id %}
                      | functionList [;\n] __ (func | passStatement) __
                        {% function(d, l) { return d[0].concat([d[3][0]]) } %}

           statement -> (expression | class | keywordStatement | condStatement | tryStatement | loop)
                        {% function(d, l) { return d[0][0] } %}

    keywordStatement -> ("break" | "continue")
                        {% function(d, l) { return ['keyword', d[0][0]] } %}
                      | passStatement
                        {% id %}
                      | ("return") (_+ expression):?
                        {% function(d, l) { return [d[0][0], d[1] ? d[1][1] : null] } %}
                      | ("throw") _+ expression
                        {% function(d, l) { return [d[0][0], d[2]] } %}

       passStatement -> "pass"
                        {% function(d, l) { return ['keyword', d[0]] } %}

               block -> ":" _ "#INDENT" __ "\n" statementList "#DEINDENT"
                        {% function(d, l) { return d[5] } %}
                      | ":" flatStatements "\n"
                        {% function(d, l) { return d[1] } %}

# Expressions

    expression -> assignment
                  {% id %}

   parenthesis -> "(" _ expression _ ")"
                  {% function(d, l) { return d[2] } %}
                | entity
                  {% id %}

  memberAccess -> memberAccess _ ("." | "?.") identifier
                  {% function(d, l) { return [d[2][0], d[0], d[3]] } %}
                | memberAccess ("[" | "?[") _ expression _ "]"
                  {% function(d, l) { return [d[1][0] + ']', d[0], d[3]] } %}
                | memberAccess "?":? range
                  {% function(d, l) { return [d[1] ? '?[]' : '[]', d[0], d[2]] } %}
                | memberAccess "?":? callList ")"
                  {% function(d, l) { return [d[1] ? '?()' : '()', d[0], d[2]] } %}
                | parenthesis
                  {% id %}

   keywordExpr -> "new" _+ memberAccess
                  {% function(d, l) { return ['new', d[2]] } %}
                | memberAccess
                  {% id %}

   postfixIncr -> keywordExpr _ ("++" | "--")
                  {% function(d, l) { return ['_' + d[2][0], d[0]] } %}
                | keywordExpr
                  {% id %}

         unary -> [+-] postfixIncr
                  {% function(d, l) { return [d[0], d[1]] } %}
                | ("++" | "--") _ postfixIncr
                  {% function(d, l) { return [d[0][0] + '_', d[2]] } %}
                | "typeof" _+ postfixIncr
                  {% function(d, l) { return [d[0], d[2]] } %}
                | postfixIncr
                  {% id %}

       wedgeOp -> wedgeOp _ "^" _ unary
                  {% function(d, l) { return [d[2], d[0], d[4]] } %}
                | unary
                  {% id %}

        starOp -> starOp _ [*/%] _ wedgeOp
                  {% function(d, l) { return [d[2], d[0], d[4]] } %}
                | wedgeOp
                  {% id %}

        plusOp -> plusOp __ [+-] _ starOp
                  {% function(d, l) { return [d[2], d[0], d[4]] } %}
                | starOp
                  {% id %}

    comparison -> plusOp _ cmpOperator _ plusOp
                  {% function(d, l) { return [d[2][0], d[0], d[4]] } %}
                | plusOp _+ ("in" | "instanceof" | "not in") _+ plusOp
                  {% function(d, l) { return [d[2][0], d[0], d[4]] } %}
                | chainedCmp
                  {% id %}
                | plusOp
                  {% id %}

   cmpOperator -> ("<=" | ">=" | [<>] | "==" | "!=")
                  {% function(d, l) { return d[0][0] } %}

    chainedCmp -> plusOp _ cmpOperator _ plusOp (_ cmpOperator _ plusOp):+
                  {% function(d, l) {
                      var r = ['chaincmp', d[0], d[2], d[4]]
                      d[5].forEach(function(x) {
                           r.push(x[1], x[3])
                      })
                      return r
                  } %}

       boolNot -> "not" _+ comparison
                  {% function(d, l) { return ['not', d[2]] } %}
                | comparison
                  {% id %}

       boolAnd -> boolAnd _+ "and" _+ boolNot
                  {% function(d, l) { return ['and', d[0], d[4]] } %}
                | boolNot
                  {% id %}

       boolOr -> boolOr _+ "or" _+ boolAnd
                  {% function(d, l) { return ['or', d[0], d[4]] } %}
                | boolAnd
                  {% id %}

   existential -> boolOr _ "??" _ existential
                  {% function(d, l) { return ['??', d[0], d[4]] } %}
                | boolOr
                  {% id %}

      inlineIf -> existential _ "?" _ inlineIf _ ":" (_ "#INDENT"):? _ inlineIf (_ "#DEINDENT"):?
                  {% function(d, l) { return ['?', d[0], d[4], d[9]] } %}
                | existential
                  {% id %}

        lambda -> arguments ")" _ "=>" _ lambda
                  {% function(d, l) { return ['lambda', d[0], d[5]] } %}
                | identifier _ "=>" _ lambda
                  {% function(d, l) { return ['lambda', [[d[0][1], null]], d[4]] } %}
                | inlineIf
                  {% id %}

    assignment -> memberAccess _ "=" _ assignment
                  {% function(d, l) { return ['=', d[0], d[4]] } %}
                | memberAccess _ [+\-*^/%] "=" _ assignment
                  {% function(d, l) { return [d[2] + d[3], d[0], d[5]] } %}
                | lambda
                  {% id %}

# Values

         literal -> (bool | number | string | array | range | object | func)
                    {% function(d, l) { return d[0][0] } %}

          entity -> (keywordEntity | identifier | literal)
                    {% function(d, l) { return d[0][0] } %}

   keywordEntity -> ("null" | "this" | "self" | "super" | "debugger")
                    {% function(d, l) { return ['keyword', d[0][0]] } %}

            bool -> ("true" | "false")
                    {% function(d, l) { return ['bool', d[0][0]] } %}

             int -> [0-9]:+
                    {% function(d, l) { return ['number', parseInt(d[0].join(''), 10)] } %}

          number -> int
                    {% id %}
                  | int:? "." int
                    {% function(d, l) { return ['number', parseFloat((d[0] ? d[0][1] : '') + '.' + d[2][1])] } %}
                  | "0x" [0-9a-fA-F]:+
                    {% function(d, l) { return ['number', parseInt(d[0] + d[1].join(''), 16)] } %}

      identifier -> [a-zA-Z_$] [0-9a-zA-Z_$]:*
                    {% function(d, l, r) {
                        var keywords = [
                            '_', 'pass',
                            'null', 'undefined', 'and', 'or', 'not', 'true', 'false',
                            'export', 'import', 'void', 'debugger', 'with',
                            'delete', 'var', 'let', 'const', 'typeof',
                            'new', 'class', 'extends', 'this', 'self', 'super',
                            'return', 'yield', 'function',
                            'if', 'else', 'elif',
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
                    {% function(d, l) { return ['string', d[0] + d[1]] } %}
                  | stringBeg2 "'"
                    {% function(d, l) { return ['string', d[0] + d[1]] } %}

      stringBeg1 -> "\""
                    {% id %}
                  | stringBeg1 [^"] #"
                    {% function(d, l) { return d.join('') } %}
                  | stringBeg1 "\\" [^]
                    {% function(d, l) { return d.join('') } %}

      stringBeg2 -> "'"
                    {% id %}
                  | stringBeg2 [^'] #'
                    {% function(d, l) { return d.join('') } %}
                  | stringBeg2 "\\" [^]
                    {% function(d, l) { return d.join('') } %}

           array -> (arrayList | "[") __ ([,\n] _):? "]"
                    {% function(d, l) { return ['array'].concat(d[0][0] != '[' ? d[0][0] : []) } %}
                  | "[" _ expression _+ forHead _ "]"
                    {% function(d, l) { return ['array', d[4].concat([d[2]])] } %}

       arrayList -> "[" _ expression
                    {% function(d, l) { return [d[2]] } %}
                  | arrayList __ [,\n] _ expression
                    {% function(d, l) { return d[0].concat([d[4]]) } %}

           range -> "[" _ (expression _ ("," _):?):? "..." _ ("," _):? (expression _):? "]"
                    {% function(d, l) { return ['range', d[2] ? d[2][0] : null, d[6] ? d[6][0] : null] } %}
                  | "[" _ expression _ "," _ expression _ ("," _):? "..." _ ("," _):? (expression _):? "]"
                    {% function(d, l) { return ['range', d[2], d[6], d[12] ? d[12][0] : null] } %}

          object -> "{" objectList "}"
                    {% function(d, l) { return ['object'].concat(d[1]) } %}
                  | "{" _ objectListItem _+ forHead _ "}"
                    {% function(d, l) { return ['object', d[4].concat([d[2]])] } %}

      objectList -> null
                    {% function(d, l) { return [] } %}
                  | (_ objectListItem __ [,\n]):* _ objectListItem __ ([,\n] _):?
                    {% function(d, l) { return d[0].map(function(x) { return x[1] }).concat([d[2]]) } %}

  objectListItem -> expression _ ":" (_ "#INDENT"):? _ expression (_ "#DEINDENT"):?
                    {% function(d, l) { return [d[0], d[5]] } %}

# Functions

                func -> "function" (_+ identifier):? _ arguments ")" _ block
                        {% function(d, l) { return ['function', d[1] ? d[1][1][1] : null, d[3], d[6]] } %}

           arguments -> (nonemptyArguments | emptyArguments)
                        {% function(d, l) { return d[0][0] } %}

      emptyArguments -> emptyCallList
                        {% id %}

   nonemptyArguments -> "(" _ argument _
                        {% function(d, l) { return [d[2]] } %}
                      | arguments "," _ argument _
                        {% function(d, l) { return d[0].concat([d[3]]) } %}

            argument -> identifier
                        {% function(d, l) { return [d[0][1], null] } %}
                      | identifier _ "=" _ expression
                        {% function(d, l) { return [d[0][1], d[4]] } %}
                      | "*" identifier
                        {% function(d, l) { return [d[1][1], '*'] } %}

            callList -> (nonemptyCallList | emptyCallList)
                        {% function(d, l) { return d[0][0] } %}

       emptyCallList -> "(" _
                        {% function(d, l) { return [] } %}

    nonemptyCallList -> "(" _ expression
                        {% function(d, l) { return [d[2]] } %}
                      | "(" _ "_"
                        {% function(d, l) { return [['keyword', '_']] } %}
                      | callList _ "," _ expression
                        {% function(d, l) { return d[0].concat([d[4]]) } %}
                      | callList _ "," _ "_"
                        {% function(d, l) { return d[0].concat([['keyword', '_']]) } %}

# Classes

        class -> "class" _+ identifier (_+ "extends" _+ expression):? _ block
                 {% function(d, l) { return ['class', d[2][1], d[3] ? d[3][3] : null, d[4]] } %}

# Conditional statements

     condStatement -> ifStatement
                      {% id %}

       ifStatement -> "if" _+ expression _ block elifStatements
                      {% function(d, l) { return ['if', [d[2], d[4]]].concat(d[5]) } %}

    elifStatements -> (_ elifStatement):* elseStatement
                      {% function(d, l) {
                          var r = d[0].map(function(x) { return x[1] })
                          if (d[1] !== null) r.push(d[1])
                          return r
                      } %}

     elifStatement -> "elif" _+ expression _ block
                      {% function(d, l) { return [d[2], d[4]] } %}

     elseStatement -> (_ "else" _ block):?
                      {% function(d, l) { return d[0] ? ['else', d[0][3]] : null } %}

# Try statement

        tryStatement -> "try" _ block catchStatement
                        {% function(d, l) { return ['try', d[2]].concat(d[3]) } %}

      catchStatement -> (_ "catch" (_+ identifier):? _ block):? finallyStatement
                        {% function(d, l) { return [d[0] ? [d[0][2] ? d[0][2][1] : null, d[0][4]] : null, d[1]] } %}

    finallyStatement -> (_ "finally" _ block):?
                        {% function(d, l) { return d[0] ? d[0][3] : null } %}

# Loops

       loop -> (forLoop | whileLoop)
               {% function(d, l) { return d[0][0] } %}

    forLoop -> forHead _ block
               {% function(d, l) { return d[0].concat([d[2]]) } %}

    forHead -> "for" _+ identifier (_ "," _ identifier):? _+ "in" _+ expression (_+ "if" _ expression):?
               {% function(d, l) { return ['for', [d[2][1], d[3] ? d[3][3][1] : null], d[7], d[8] ? d[8][3] : null] } %}

  whileLoop -> "while" _+ expression _ block
               {% function(d, l) { return ['while', d[2], d[4]] } %}

# Whitespace

     _ -> [\s]:*        {% function(d, l) { return null } %}
    _+ -> [\s]:+        {% function(d, l) { return null } %}
    __ -> [^\S\n]:*     {% function(d, l) { return null } %}
