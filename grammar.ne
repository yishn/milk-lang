statementList -> (_ statement _ [;\n]):*
                 {% function(d) { return d[0].map(function(x) { return x[1] }) } %}

    statement -> expression
                 {% id %}

# Expressions

    expression -> inlineIf
                  {% id %}

   parenthesis -> "(" _ expression _ ")"
                  {% function(d) { return d[2] } %}
                | entity
                  {% id %}

  memberAccess -> memberAccess "." identifier
                  {% function(d) { return [d[1], d[0], d[2]] } %}
                | memberAccess "?." identifier
                  {% function(d) { return [d[1], d[0], d[2]] } %}
                | memberAccess "[" _ expression _ "]"
                  {% function(d) { return ['[]', d[0], d[3]] } %}
                | memberAccess "?[" _ expression _ "]"
                  {% function(d) { return ['?[]', d[0], d[3]] } %}
                | memberAccess "[" _ expression _ ":" _ expression _ "]"
                  {% function(d) { return ['[]', d[0], d[3], d[7]] } %}
                | memberAccess "?[" _ expression _ ":" _ expression _ "]"
                  {% function(d) { return ['?[]', d[0], d[3], d[7]] } %}
                | memberAccess "(" _ (callList | ")")
                  {% function(d) { return ['()', d[0], d[3][0] != ')' ? d[3][0] : []] } %}
                | memberAccess "?(" _ (callList | ")")
                  {% function(d) { return ['?()', d[0], d[3][0] != ')' ? d[3][0] : []] } %}
                | parenthesis
                  {% id %}

      callList -> expression _ ")"
                  {% function(d) { return [d[0]] } %}
                | "_" _ ")"
                  {% function(d) { return [['keyword', '_']] } %}
                | expression _ "," _ callList
                  {% function(d) { return [d[0]].concat(d[4]) } %}
                | "_" _ "," _ callList
                  {% function(d) { return [['keyword', '_']].concat(d[4]) } %}

   postfixIncr -> memberAccess _ ("++" | "--")
                  {% function(d) { ['_' + d[2][0], d[0]] } %}
                | memberAccess
                  {% id %}

         unary -> [+-] postfixIncr
                  {% function(d) { return [d[0], d[1]] } %}
                | ("++" | "--") _ postfixIncr
                  {% function(d) { return [d[0][0] + '_', d[2]] } %}
                | "typeof" __ postfixIncr
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

        plusOp -> plusOp _ [+-] _ starOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | starOp
                  {% id %}

    comparison -> comparison _ "<=" _ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | comparison _ ">=" _ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | comparison _ [<>] _ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | comparison _ "==" _ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | comparison _ "!=" _ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | comparison __ "in" __ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | comparison __ "of" __ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | comparison __ "instanceof" __ plusOp
                  {% function(d) { return [d[2], d[0], d[4]] } %}
                | plusOp
                  {% id %}

       boolNot -> "not" __ comparison
                  {% function(d) { return ['not', d[2]] } %}
                | comparison
                  {% id %}

       boolAnd -> boolAnd __ "and" __ boolNot
                  {% function(d) { return ['and', d[0], d[4]] } %}
                | boolNot
                  {% id %}

       boolOr -> boolOr __ "or" __ boolAnd
                  {% function(d) { return ['or', d[0], d[4]] } %}
                | boolAnd
                  {% id %}

   existential -> boolOr _ "??" _ existential
                  {% function(d) { return ['?', ['==', d[0], ['void', 'null']], d[4], d[0]] } %}
                | boolOr
                  {% id %}

      inlineIf -> existential _ "?" _ inlineIf _ ":" _ inlineIf
                  {% function(d) { return ['?', d[0], d[4], d[8]] } %}
                | existential
                  {% id %}

# Values

         literal -> (void | bool | number | string | array | func)
                    {% function(d) { return d[0][0] } %}

          entity -> (identifier | literal)
                    {% function(d) { return d[0][0] } %}

            void -> "null"
                    {% function(d) { return ['keyword', 'null'] } %}

            bool -> ("true" | "false")
                    {% function(d) { return ['bool', d[0][0]] } %}

          number -> [0-9]:+
                    {% function(d) { return ['number', parseInt(d[0].join(''), 10)] } %}
                  | number:? "." number
                    {% function(d) { return ['number', parseFloat((d[0] ? d[0][1] : '') + '.' + d[2][1])] } %}

      identifier -> [a-zA-Z_$] [0-9a-zA-Z_$]:*
                    {% function(d, _, r) {
                        var keywords = [
                            '_',
                            'null', 'undefined', 'and', 'or', 'not', 'true', 'false',
                            'export', 'import', 'void', 'debugger', 'with',
                            'delete', 'var', 'let', 'const', 'typeof',
                            'new', 'class', 'extends', 'this', 'self', 'super', 'endclass',
                            'func', 'return', 'yield', 'endfunc', 'function',
                            'if', 'else', 'elif', 'endif',
                            'switch', 'case', 'default', 'endswitch',
                            'do', 'while', 'break', 'continue', 'endwhile',
                            'for', 'in', 'of', 'instanceof', 'endfor',
                            'try', 'catch', 'finally', 'throw', 'endtry',
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

          string -> stringBeginning1 "\""
                    {% function(d) { return ['string', d[0] + d[1]] } %}
                  | stringBeginning2 "'"
                    {% function(d) { return ['string', d[0] + d[1]] } %}

stringBeginning1 -> "\""
                    {% id %}
                  | stringBeginning1 [^"\n]
                    {% function(d) { return d[0] + d[1] } %}
                  | stringBeginning1 "\\" .
                    {% function(d) { return d[0] + d[1] + d[2] } %}

stringBeginning2 -> "'"
                    {% id %}
                  | stringBeginning2 [^'\n]
                    {% function(d) { return d[0] + d[1] } %}
                  | stringBeginning2 "\\" .
                    {% function(d) { return d[0] + d[1] + d[2] } %}

           array -> (arrayList | "[") _ "]"
                    {% function(d) { return ['array', d[0][0] != '[' ? d[0][0] : []] } %}

       arrayList -> "[" _ expression
                    {% function(d) { return [d[2]] } %}
                  | arrayList _ "," _ expression
                    {% function(d) { return d[0].concat([d[4]]) } %}

# Functions
# ['function', name, [args1, args2, ...], [statement1, statement2, ...]]

          func -> "func" (__ identifier):? _ (arguments | "(") ")" _ ":" statementList "endfunc"
                  {% function(d) {
                      return ['function',
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
                | identifier _ "=" _ literal
                  {% function(d) { return [d[0][1], d[4]] } %}
                | "..." _ identifier
                  {% function(d) { return [d[2][1], '...'] } %}

# Whitespace

 _ -> [\s]:*    {% function(d) { return null } %}
__ -> [\s]:+    {% function(d) { return null } %}
