(function() {
var tokenize, parse, translate, commentate;
/*@3:1*/
// -*- javascript -*-
tokenize = require('./lexer').tokenize;
parse = require('./parser').parse;
translate = require('./translator').translate;
/*@6:1*/
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
    /*@9:5*/
    data = data.replace(/\r\n/g, '\n').replace(/\r/g, '');
    (function(r) {
        tokens = r[0];
        indent = r[1];
        return r;
    })(tokenize(data));
    /*@11:5*/
    options.indent = indent;
    comments = tokens.filter(function() {
        var type;
        (function(r) {
            (function(r1) {
                type = r1[0];
                return r1;
            })(r[0]);
            return r;
        })(arguments);
        return type === 'comment';
    });
    /*@14:5*/
    tokens = tokens.filter(function() {
        var type;
        (function(r) {
            (function(r1) {
                type = r1[0];
                return r1;
            })(r[0]);
            return r;
        })(arguments);
        return type !== 'comment';
    });
    /*@16:5*/
    tree = parse(tokens);
    code = translate(tree, options);
    code = commentate(code, data, comments);
    /*@20:5*/
    return code;
};
})();
