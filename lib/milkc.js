(function() {
var process, fs, path, minimist, helper, milk, argv, endsWithMilk, replaceMilk, readdirRecursive;
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
argv = minimist(process.argv.slice(2));
endsWithMilk = function(filename) {
    return path.extname(filename) === '.milk';
};
/*@11:1*/
replaceMilk = function(filename) {
    return filename.slice(0, (filename.length - 6) + 1) + '.js';
};
readdirRecursive = function(p) {
    var items, i1, l, item, i;
    /*@14:5*/
    items = fs.readdirSync(p).map(function(x) {
        return path.join(p, x);
    });
    l = items;
    for (i1 in l) {
        item = l[i1];
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        if (!(fs.statSync(item).isDirectory())) continue;
        /*@17:9*/
        items = items.concat(readdirRecursive(item));
    };
    return items.filter(function(x) {
        return fs.statSync(x).isFile();
    });
};
/*@23:1*/
// Main
if (argv._.length > 0) {
    var p, stats, deststats, files, i2, l1, file, i;
    (function(ref) {
        p = ref[0];
        return ref;
    })(argv._);
    /*@25:5*/
    (function(ref1) {
        stats = ref1[0];
        deststats = ref1[1];
        return ref1;
    })([fs.statSync(p), argv.o ? fs.statSync(argv.o) : null]);
    /*@26:5*/
    files = [];
    if (stats.isFile()) {
        files = [p];
    } else if (stats.isDirectory()) {
        /*@31:9*/
        files = readdirRecursive(p).filter(endsWithMilk);
    } else {
        console.error('Invalid input.');
        return;
    };
    /*@36:5*/
    if ((deststats != null) && (!deststats.isDirectory())) {
        console.error('Invalid output.');
        return;
    };
    /*@40:5*/
    l1 = files;
    for (i2 in l1) {
        file = l1[i2];
        i = parseInt(i2, 10);
        if (isNaN(i)) i = i2;
        var data, output, percent;
        /*@41:9*/
        data = fs.readFileSync(file, 'utf-8');
        output = null;
        console.error(('Compiling ' + path.basename(file)) + '...');
        /*@45:9*/
        try {
            output = milk.compile(data);
        } catch (e) {
            var row, col;
            /*@48:13*/
            (function(ref2) {
                row = ref2[0];
                col = ref2[1];
                return ref2;
            })(helper.offsetToLinePos(e.offset, data));
            /*@49:13*/
            console.error((((e.message + ' @') + row) + ':') + col);
            return;
        };
        if (deststats == null) {
            /*@53:13*/
            console.log(output);
        } else {
            var dir, milkfile;
            dir = p;
            /*@56:13*/
            if (stats.isFile()) {
                dir = path.dirname(p);
            };
            milkfile = compose(replaceMilk, path.join)(argv.o, path.relative(dir, file));
            /*@59:13*/
            fs.writeFileSync(milkfile, output);
        };
        percent = Math.round(((i + 1) * 100) / files.length);
        console.error(percent + '%');
    };
};
})();
