(function() {
var app, process, fs, path, minimist, helper, milk, argv, endsWithMilk, replaceMilk, readdirRecursive, compile, p, stats, deststats, files;
compose = function(x, y, c1, c2) {
    return function() {
        return x.call(c1, y.apply(c2, arguments));
    }
}
/*@1:1*/
app = require('../package.json');
process = require('process');
fs = require('fs');
/*@4:1*/
path = require('path');
minimist = require('minimist');
helper = require('./helper');
/*@7:1*/
milk = require('./milk');
argv = minimist(process.argv.slice(2), {
    string: ['o'],
    boolean: ['b', 'h', 'v', 'w']
});
/*@14:1*/
endsWithMilk = function(filename) {
    return path.extname(filename) === '.milk';
};
replaceMilk = function(filename) {
    return filename.slice(0, (filename.length - 6) + 1) + '.js';
};
/*@17:1*/
readdirRecursive = function(p) {
    var items, i1, l, item, i;
    items = fs.readdirSync(p).map(function(x) {
        return path.join(p, x);
    });
    /*@20:5*/
    l = items;
    for (i1 in l) {
        item = l[i1];
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        if (!(fs.statSync(item).isDirectory())) continue;
        /*@21:9*/
        items = items.concat(readdirRecursive(item));
    };
    return items.filter(function(x) {
        return fs.statSync(x).isFile();
    });
};
/*@25:1*/
compile = function(file) {
    var data, output;
    (function(r) {
        data = r[0];
        output = r[1];
        return r;
    })([null, null]);
    /*@27:5*/
    try {
        data = fs.readFileSync(file, 'utf-8');
    } catch (e) {
        console.error('File cannot be read.');
        /*@31:9*/
        return;
    };
    console.error(('Compiling ' + path.basename(file)) + '...');
    try {
        /*@36:9*/
        output = milk.compile(data, {
            wrapper: !argv.b
        });
    } catch (e) {
        var message, offset, row, col;
        (function(r) {
            message = r.message;
            offset = r.offset;
            return r;
        })(e);
        /*@40:9*/
        (function(r) {
            row = r[0];
            col = r[1];
            return r;
        })(helper.offsetToLinePos(offset, data));
        /*@41:9*/
        console.error((((message + ' @') + row) + ':') + col);
        return;
    };
    if (deststats == null) {
        /*@45:9*/
        console.log(output);
    } else {
        var dir, milkfile, r;
        dir = p;
        /*@48:9*/
        if (stats.isFile()) {
            dir = path.dirname(p);
        };
        milkfile = compose(replaceMilk, (r = path).join, null, r)(argv.o, path.relative(dir, file));
        /*@51:9*/
        fs.writeFileSync(milkfile, output);
    };
};

// Main
(function(r) {
    p = (function() {
        var r1;
        r1 = r[0];
        if (((typeof r1) === 'undefined') || (r1 == null)) {
            return './';
        };
        return r1;
    })();
    return r;
})(argv._);
/*@56:1*/
(function(r) {
    stats = r[0];
    deststats = r[1];
    return r;
})([fs.statSync(p), argv.o ? fs.statSync(argv.o) : null]);
/*@57:1*/
files = [];
if (argv.h) {
    console.log(['Usage: milkc [options] [path]', '', '[path] can be a Milk file or a directory. If [path] is not specified,', '`milkc` will use the current directory.', '', ['', '-b      ', 'compile without a top-level function wrapper'].join('    '), ['', '-h      ', 'display this help message'].join('    '), ['', '-o [dir]', 'set the output directory for compiled JavaScript'].join('    '), ['', '-v      ', 'display the version number'].join('    '), ['', '-w      ', 'watch Milk scripts for changes and rerun commands'].join('    ')].join('\n'));
    /*@72:5*/
    return;
};
if (argv.v) {
    console.log([app.productName, 'version', app.version].join(' '));
    /*@76:5*/
    return;
};
if ((deststats != null) && (!deststats.isDirectory())) {
    console.error('Invalid output.');
    /*@80:5*/
    return;
};
if (!argv.w) {
    var i1, l, file, i;
    /*@83:5*/
    if (stats.isFile()) {
        files = [p];
    } else if (stats.isDirectory()) {
        files = readdirRecursive(p).filter(endsWithMilk);
    } else {
        /*@88:9*/
        console.error('Invalid input.');
        return;
    };
    l = files;
    for (i1 in l) {
        file = l[i1];
        i = parseInt(i1, 10);
        if (isNaN(i)) i = i1;
        var percent;
        /*@92:9*/
        compile(file);
        percent = Math.round(((i + 1) * 100) / files.length);
        console.error(percent + '%');
    };
} else {
    var lasttime, callback;
    /*@97:5*/
    lasttime = new Date();
    callback = function(event, file) {
        if (((!endsWithMilk(file)) || (event !== 'change')) || (((new Date()) - lasttime) <= 1000)) {
            /*@103:13*/
            return;
        };
        lasttime = new Date();
        compile(path.join(p, file));
        /*@107:9*/
        console.error('Done.');
    };
    fs.watch(p, {
        recursive: true
    }, callback);
};
})();
