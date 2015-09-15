# Statements

       statementList -> _ statement __
                        {% function(d) { return ['statements', d[1]] } %}
                      | statementList [;\n] __
                        {% id %}
                      | statementList [;\n] __ statement __
                        {% function(d) { return d[0].concat([d[3]]) } %}

        functionList -> _ func __
                        {% function(d) { return ['functions', d[1]] } %}
                      | functionList [;\n] __
                        {% id %}
                      | functionList [;\n] __ func __
                        {% function(d) { return d[0].concat([d[3]]) } %}

           statement -> (expression | class | keywordStatement | condStatement | tryStatement | loop)
                        {% function(d) { return d[0][0] } %}

    keywordStatement -> ("break" | "continue" | "pass")
                        {% function(d) { return d[0][0] } %}
                      | ("return") (_+ expression):?
                        {% function(d) { return [d[0][0], d[1] ? d[1][1] : null] } %}
                      | ("throw") _+ expression
                        {% function(d) { return [d[0][0], d[2]] } %}

# Expressions

    expression -> assignment
                  {% id %}

   parenthesis -> "(" _ expression _ ")"
                  {% function(d) { return d[2] } %}
                | entity
                  {% id %}

  memberAccess -> memberAccess _ "." identifier
                  {% function(d) { return [d[2], d[0], d[3]] } %}
                | memberAccess _ "?." identifier
                  {% function(d) { return [d[2], d[0], d[3]] } %}
                | memberAccess "[" _ expression _ "]"
                  {% function(d) { return ['[]', d[0], d[3]] } %}
                | memberAccess "?[" _ expression _ "]"
                  {% function(d) { return ['?[]', d[0], d[3]] } %}
                | memberAccess range
                  {% function(d) { return ['[]', d[0], d[1]] } %}
                | memberAccess "?" range
                  {% function(d) { return ['?[]', d[0], d[2]] } %}
                | memberAccess "(" _ (callList | ")")
                  {% function(d) { return ['()', d[0], d[3][0] != ')' ? d[3][0] : []] } %}
                | memberAccess "?(" _ (callList | ")")
                  {% function(d) { return ['?()', d[0], d[3][0] != ')' ? d[3][0] : []] } %}
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

         unary -> [+-] postfixIncr
                  {% function(d) { return [d[0], d[1]] } %}
                | ("++" | "--") _ postfixIncr
                  {% function(d) { return [d[0][0] + '_', d[2]] } %}
                | "typeof" _+ postfixIncr
                  {% function(d) { return [d[0], d[2]] } %}
                | postfixIncr
                  {% id %}

       wedgeOp -> wedgeOp _ "^" _ unary
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | unary
                  {% id %}

        starOp -> starOp _ [*/%] _ wedgeOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | wedgeOp
                  {% id %}

        plusOp -> plusOp __ [+-] _ starOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | starOp
                  {% id %}

    comparison -> plusOp _ ("<=" | ">=" | [<>] | "==" | "!=") _ plusOp
                  {% function(d) { return [d[2][0], d[0], d[4]] } %}
                | plusOp _+ ("in" | "instanceof") _+ plusOp
                  {% function(d) { return [d[2][0], d[0], d[4]] } %}
                | chainedCmp
                  {% id %}
                | plusOp
                  {% id %}

    chainedCmp -> plusOp _ ("<=" | ">=" | [<>]) _ plusOp _ ("<=" | ">=" | [<>]) _ plusOp
                  {% function(d) {
                      return ['and', [
                          d[2][0], d[0], d[4]
                      ], [
                          d[6][0], d[4], d[8]
                      ]]
                  } %}
                | chainedCmp _ ("<=" | ">=" | [<>]) _ plusOp
                  {% function(d) {
                      return ['and', d[0], [d[2], d[0][2][2], d[4]]]
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

   existential -> boolOr _ "??" _ existential
                  {% function(d) { return ['?', ['==', d[0], ['keyword', 'null']], d[4], d[0]] } %}
                | boolOr
                  {% id %}

      inlineIf -> existential _ "?" _ inlineIf _ ":" _ inlineIf
                  {% function(d) { return ['?', d[0], d[4], d[8]] } %}
                | existential
                  {% id %}

        lambda -> arguments ")" _ "=>" _ lambda
                  {% function(d) { return ['lambda', d[0], d[5]] } %}
                | identifier _ "=>" _ lambda
                  {% function(d) { return ['lambda', [[d[0][1], null]], d[4]] } %}
                | "(" _ ")" _ "=>" _ lambda
                  {% function(d) { return ['lambda', [], d[6]] } %}
                | inlineIf
                  {% id %}

    assignment -> memberAccess _ "=" _ assignment
                  {% function(d) { return ['=', d[0], d[4]] } %}
                | memberAccess _ [+\-*^/%] "=" _ assignment
                  {% function(d) { return [d[2] + d[3], d[0], d[5]] } %}
                | lambda
                  {% id %}

# Values

         literal -> (bool | number | string | array | range | object | func)
                    {% function(d) { return d[0][0] } %}

          entity -> (keywordEntity | identifier | literal)
                    {% function(d) { return d[0][0] } %}

   keywordEntity -> ("null" | "this" | "self" | "super")
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
                            '_', 'pass', 'end',
                            'null', 'undefined', 'and', 'or', 'not', 'true', 'false',
                            'export', 'import', 'void', 'debugger', 'with',
                            'delete', 'var', 'let', 'const', 'typeof',
                            'new', 'class', 'extends', 'this', 'self', 'super',
                            'func', 'return', 'yield', 'function',
                            'if', 'else', 'elif',
                            'switch', 'case', 'default',
                            'do', 'while', 'break', 'continue',
                            'for', 'in', 'of', 'instanceof',
                            'try', 'catch', 'finally', 'throw',
                            'await', 'defer',

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
                  | stringBeg1 [^"] #"
                    {% function(d) { return d[0] + d[1] } %}
                  | stringBeg1 "\\" [^]
                    {% function(d) { return d[0] + d[1] + d[2] } %}

      stringBeg2 -> "'"
                    {% id %}
                  | stringBeg2 [^'] #'
                    {% function(d) { return d[0] + d[1] } %}
                  | stringBeg2 "\\" [^]
                    {% function(d) { return d[0] + d[1] + d[2] } %}

           array -> (arrayList | "[") __ ([,\n] _):? "]"
                    {% function(d) { return ['array'].concat(d[0][0] != '[' ? d[0][0] : []) } %}
                  | "[" _ expression _+ forHead _ "]"
                    {% function(d) { return ['array', d[4].concat([d[2]])] } %}

       arrayList -> "[" _ expression
                    {% function(d) { return [d[2]] } %}
                  | arrayList __ [,\n] _ expression
                    {% function(d) { return d[0].concat([d[4]]) } %}

           range -> "[" _ (expression _ ("," _):?):? "..." _ ("," _):? (expression _):? "]"
                    {% function(d) { return ['range', d[2] ? d[2][0] : null, d[6] ? d[6][0] : null] } %}
                  | "[" _ expression _ "," _ expression _ ("," _):? "..." _ ("," _):? (expression _):? "]"
                    {% function(d) { return ['range', d[2], d[6], d[12] ? d[12][0] : null] } %}

          object -> "{" objectList "}"
                    {% function(d) { return ['object'].concat(d[1]) } %}
                  | "{" _ objectListItem _+ forHead _ "}"
                    {% function(d) { return ['object', d[4].concat([d[2]])] } %}

      objectList -> null
                    {% function(d) { return [] } %}
                  | (_ objectListItem __ [,\n]):* _ objectListItem __ ([,\n] _):?
                    {% function(d) { return d[0].map(function(x) { return x[1] }).concat([d[2]]) } %}

  objectListItem -> expression _ ":" _ expression
                    {% function(d) { return [d[0], d[4]] } %}

# Functions

          func -> "func" (_+ identifier):? _ (arguments | "(") ")" _ ":" statementList [\s] "end"
                  {% function(d) {
                      return ['func',
                          d[1] ? d[1][1][1] : null,
                          d[3][0] == '(' ? [] : d[3][0],
                          d[7]]
                  } %}

     arguments -> "(" _ argument _
                  {% function(d) { return [d[2]] } %}
                | arguments "," _ argument _
                  {% function(d) { return d[0].concat([d[3]]) } %}

      argument -> identifier
                  {% function(d) { return [d[0][1], null] } %}
                | identifier _ "=" _ expression
                  {% function(d) { return [d[0][1], d[4]] } %}
                | "*" identifier
                  {% function(d) { return [d[1][1], '*'] } %}

      callList -> expression _ ")"
                  {% function(d) { return [d[0]] } %}
                | "_" _ ")"
                  {% function(d) { return [['keyword', '_']] } %}
                | expression _ "," _ callList
                  {% function(d) { return [d[0]].concat(d[4]) } %}
                | "_" _ "," _ callList
                  {% function(d) { return [['keyword', '_']].concat(d[4]) } %}

# Classes

        class -> "class" _+ identifier (_+ "extends" _+ expression):? _ ":" functionList [\s] "end"
                 {% function(d) { return ['class', d[2][1], d[3] ? d[3][3] : null, d[6]] } %}

# Conditional statements

     condStatement -> ifStatement
                      {% id %}

       ifStatement -> "if" _+ expression _ ":" statementList elifStatements
                      {% function(d) { return ['if', [d[2], d[5]]].concat(d[6]) } %}

    elifStatements -> ("elif" _+ expression _ ":" statementList):* elseStatement
                      {% function(d) {
                          return d[0].map(function(x) {
                              return [x[2], x[5]]
                          }).concat(d[1] ? [d[1]] : [])
                      } %}

     elseStatement -> ("else" _ ":" statementList):? [\s] "end"
                      {% function(d) { return d[0] ? ['else', d[0][3]] : null } %}

# Try statement

        tryStatement -> "try" _ ":" statementList catchStatement
                        {% function(d) { return ['try', d[3]].concat(d[4]) } %}

      catchStatement -> ("catch" (_+ identifier):? _ ":" statementList):? finallyStatement
                        {% function(d) { return [d[0] ? [d[0][1] ? d[0][1][1] : null, d[0][4]] : null, d[1]] } %}

    finallyStatement -> ("finally" _ ":" statementList):? [\s] "end"
                        {% function(d) { return d[0] ? d[0][3] : null } %}

# Loops

       loop -> (forLoop | whileLoop)
               {% function(d) { return d[0][0] } %}

    forLoop -> forHead _ ":" statementList [\s] "end"
               {% function(d) { return d[0].concat([d[3]]) } %}

    forHead -> "for" _+ identifier _+ "in" _+ expression (_+ "if" _ expression):?
               {% function(d) { return ['for', d[2][1], d[6], d[7] ? d[7][3] : null] } %}

  whileLoop -> "while" _+ expression _ ":" statementList [\s] "end"
               {% function(d) { return ['while', d[2], d[5]] } %}

# Whitespace

     _ -> [\s]:*        {% function(d) { return null } %}
    _+ -> [\s]:+        {% function(d) { return null } %}
    __ -> [^\S\n]:*     {% function(d) { return null } %}
