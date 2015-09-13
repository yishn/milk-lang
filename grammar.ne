statementList -> null
                 {% function(d) { return [] } %}
               | _ statement _
                 {% function(d) { return [d[1]] } %}
               | statementList ("\n" | ";") _ statement _
                 {% function(d) { return d[0].concat([d[3]]) } %}

    statement -> expression
                 {% id %}

# Expressions

expressionList -> expression
                  {% function(d) { return [d[0]] } %}
                | expressionList _ "," _ expression
                  {% function(d) { return d[0].concat([d[4]]) } %}

    expression -> parenthesis
                  {% id %}
                | plusOp
                  {% id %}

   parenthesis -> object
                  {% id %}
                | "(" _ parenthesis _ ")"
                  {% function(d) { return d[2] } %}
                | "(" _ plusOp _ ")"
                  {% function(d) { return d[2] } %}
                | parenthesis "." identifier
                  {% function(d) { return ['.', d[0], d[2]] } %}
                | parenthesis "[" _ expression _ "]"
                  {% function(d) { return ['[]', d[0], d[3]] } %}
                | parenthesis "(" _ (expressionList | null) _ ")"
                  {% function(d) { return ['()', d[0], d[3] ? d[3] : []] } %}

       wedgeOp -> wedgeOp _ "^" _ parenthesis
                  {% function(d) { return ['^', d[0], d[4]] } %}
                | parenthesis
                  {% id %}

        starOp -> starOp _ "*" _ wedgeOp
                  {% function(d) { return ['*', d[0], d[4]] } %}
                | starOp _ "/" _ wedgeOp
                  {% function(d) { return ['/', d[0], d[4]] } %}
                | wedgeOp
                  {% id %}

        plusOp -> plusOp _ "+" _ starOp
                  {% function(d) { return ['+', d[0], d[4]] } %}
                | plusOp _ "-" _ starOp
                  {% function(d) { return ['-', d[0], d[4]] } %}
                | starOp
                  {% id %}

# Values

         object -> (number | identifier | string | array | function)
                   {% function(d) { return d[0][0] } %}

         number -> [1-9] [0-9]:*
                   {% function(d) { return ['number', parseInt(d[0] + d[1].join(''))] } %}
                 | number:? "." number
                   {% function(d) { return ['number', parseFloat((d[0] ? d[0][1] : '') + '.' + d[2][1])] } %}

     identifier -> [a-zA-Z_] [0-9a-zA-Z_]:*
                   {% function(d) { return ['identifier', d[0] + d[1].join('')] } %}

         string -> stringBeginning "\""
                   {% function(d) { return ['string', d[0] + d[1]] } %}

stringBeginning -> "\""
                   {% id %}
                 | stringBeginning [^"\n]
                   {% function(d) { return d[0] + d[1] } %}
                 | stringBeginning "\\" .
                   {% function(d) { return d[0] + d[1] + d[2] } %}

          array -> "[" _ (expressionList | null) _ "]"
                   {% function(d) { return ['array', d[2] ? d[2] : []] } %}

# Functions
# ['function', ['identifier', name], [args1, args2, ...], [statement1, statement2, ...]]

    function -> functionHead _ "{" statementList "}"
                {% function(d) { return ['function', d[0][0], d[0][1], d[3]] } %}

functionHead -> "function" _ "(" arguments ")"
                {% function(d) { return [null, d[3]] } %}
              | "function" __ identifier _ "(" arguments ")"
                {% function(d) { return [d[2], d[5]] } %}

   arguments -> null
                {% function(d) { return [] } %}
              | _ identifier _
                {% function(d) { return [d[1]] } %}
              | arguments "," _ identifier _
                {% function(d) { return d[0].concat([d[3]]) } %}

# Whitespace

 _ -> [\s]:*    {% function(d) { return null } %}
__ -> [\s]:+    {% function(d) { return null } %}
