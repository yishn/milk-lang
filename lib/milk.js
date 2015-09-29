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
    (function(ref) {
        data = ref[0];
        options = (function() {
            var r;
            r = ref[1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return {};
            };
            return r;
        })();
        return ref;
    })(arguments);
    /*@7:5*/
    data = data.replace(/\r\n/g, '\n').replace(/\r/g, '');
    (function(ref1) {
        tokens = ref1[0];
        indent = ref1[1];
        return ref1;
    })(tokenize(data));
    /*@9:5*/
    options.indent = indent;
    comments = tokens.filter(function() {
        var type;
        (function(ref2) {
            (function(ref3) {
                type = ref3[0];
                return ref3;
            })(ref2[0]);
            return ref2;
        })(arguments);
        return type === 'comment';
    });
    /*@12:5*/
    tokens = tokens.filter(function() {
        var type;
        (function(ref4) {
            (function(ref5) {
                type = ref5[0];
                return ref5;
            })(ref4[0]);
            return ref4;
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
