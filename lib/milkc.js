(function() {
var process, fs, path, minimist, helper, milk, argv, endsWithMilk, replaceMilk, readdirRecursive, compile, p, stats, deststats, files, i2, l1, file, i;
compose = function(x, y) {
    return function() {
        if (arguments.length <= 1)
            return x(y(arguments[0]));
        return x(y.apply(this, arguments));
    }
}
/*@1:1*/
process = require('process');
fs = require('fs');
path = require('path');
/*@4:1*/
minimist = require('minimist');
helper = require('./helper');
milk = require('./milk');
/*@8:1*/
argv = minimist(process.argv.slice(2), {
    string: 'o',
    boolean: 'w'
});
endsWithMilk = function(filename) {
    return path.extname(filename) === '.milk';
};
/*@14:1*/
replaceMilk = function(filename) {
    return filename.slice(0, (filename.length - 6) + 1) + '.js';
};
readdirRecursive = function(p) {
    var items, i1, l, item, i;
    /*@17:5*/
    items = fs.readdirSync(p).map(function(x) {
        return path.join(p, x);
    });
    l = items;
    for (i1 in l) {
        item = l[i1];
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        if (!(fs.statSync(item).isDirectory())) continue;
        /*@20:9*/
        items = items.concat(readdirRecursive(item));
    };
    return items.filter(function(x) {
        return fs.statSync(x).isFile();
    });
};
/*@24:1*/
compile = function(file) {
    var data, output;
    data = fs.readFileSync(file, 'utf-8');
    output = null;
    /*@28:5*/
    try {
        output = milk.compile(data);
    } catch (e) {
        var message, offset, row, col;
        (function(ref) {
            message = ref.message;
            offset = ref.offset;
            return ref;
        })(e);
        /*@31:9*/
        (function(ref1) {
            row = ref1[0];
            col = ref1[1];
            return ref1;
        })(helper.offsetToLinePos(offset, data));
        /*@32:9*/
        console.error((((message + ' @') + row) + ':') + col);
        return;
    };
    if (deststats == null) {
        /*@36:9*/
        console.log(output);
    } else {
        var dir, milkfile;
        dir = p;
        /*@39:9*/
        if (stats.isFile()) {
            dir = path.dirname(p);
        };
        milkfile = compose(replaceMilk, path.join)(argv.o, path.relative(dir, file));
        /*@42:9*/
        fs.writeFileSync(milkfile, output);
    };
};

// Main
if (argv._.length === 0) {
    /*@47:5*/
    console.error('Invalid input.');
    return;
};
(function(ref2) {
    p = ref2[0];
    return ref2;
})(argv._);
/*@51:1*/
(function(ref3) {
    stats = ref3[0];
    deststats = ref3[1];
    return ref3;
})([fs.statSync(p), argv.o ? fs.statSync(argv.o) : null]);
/*@52:1*/
files = [];
if (stats.isFile()) {
    files = [p];
} else if (stats.isDirectory()) {
    /*@57:5*/
    files = readdirRecursive(p).filter(endsWithMilk);
} else {
    console.error('Invalid input.');
    return;
};
/*@62:1*/
if ((deststats != null) && (!deststats.isDirectory())) {
    console.error('Invalid output.');
    return;
};
/*@66:1*/
l1 = files;
for (i2 in l1) {
    file = l1[i2];
    i = parseInt(i2, 10);
    if (isNaN(i)) i = i2;
    var data, output, percent;
    /*@67:5*/
    data = fs.readFileSync(file, 'utf-8');
    console.error(('Compiling ' + path.basename(file)) + '...');
    output = compile(file);
    /*@72:5*/
    percent = Math.round(((i + 1) * 100) / files.length);
    console.error(percent + '%');
};
})();
