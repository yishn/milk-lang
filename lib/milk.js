(function() {
var tokenize, parse, translate, commentate;
/*@1:1*/
tokenize = require('./lexer').tokenize;
parse = require('./parser').parse;
translate = require('./translator').translate;
/*@4:1*/
commentate = require('./helper').commentate;
exports.compile = function() {
    var data, options, tokens, comments, tree, code;
    (function(ref) {
        data = ref[0];
        options = (function() {
            var r;
            r = ref[1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return null;
            };
            return r;
        })();
        return ref;
    })(arguments);
    /*@7:5*/
    data = data.replace(/\r\n/g, '\n').replace(/\r/g, '');
    tokens = tokenize(data);
    comments = tokens.filter(function() {
        var type;
        (function(ref1) {
            (function(ref2) {
                type = ref2[0];
                return ref2;
            })(ref1[0]);
            return ref1;
        })(arguments);
        return type === 'comment';
    });
    /*@11:5*/
    tokens = tokens.filter(function() {
        var type;
        (function(ref3) {
            (function(ref4) {
                type = ref4[0];
                return ref4;
            })(ref3[0]);
            return ref3;
        })(arguments);
        return type !== 'comment';
    });
    /*@13:5*/
    tree = parse(tokens);
    code = translate(tree, options);
    return commentate(code, data, comments);
};
})();