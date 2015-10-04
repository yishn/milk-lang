(function() {
var tokenize, parse, translate, commentate;
/*@1:1*/
tokenize = require('./lexer').tokenize;
parse = require('./parser').parse;
translate = require('./translator').translate;
/*@4:1*/
commentate = require('./helper').commentate;
exports.compile = function() {
    var data, options, tokens, indent, comments, tree, code;
    (function(r) {
        data = r[0];
        options = (function() {
            var r1;
            r1 = r[1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return {};
            };
            return r1;
        })();
        return r;
    })(arguments);
    /*@7:5*/
    data = data.replace(/\r\n/g, '\n').replace(/\r/g, '');
    (function(r2) {
        tokens = r2[0];
        indent = r2[1];
        return r2;
    })(tokenize(data));
    /*@9:5*/
    options.indent = indent;
    comments = tokens.filter(function() {
        var type;
        (function(r3) {
            (function(r4) {
                type = r4[0];
                return r4;
            })(r3[0]);
            return r3;
        })(arguments);
        return type === 'comment';
    });
    /*@12:5*/
    tokens = tokens.filter(function() {
        var type;
        (function(r5) {
            (function(r6) {
                type = r6[0];
                return r6;
            })(r5[0]);
            return r5;
        })(arguments);
        return type !== 'comment';
    });
    /*@14:5*/
    tree = parse(tokens);
    code = translate(tree, options);
    code = commentate(code, data, comments);
    /*@18:5*/
    return code;
};
})();
