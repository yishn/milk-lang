(function() {
var process, fs, path, minimist, helper, milk, argv, endsWithMilk, replaceMilk, readdirRecursive, compile, p, stats, deststats, files;
compose = function(x, y, c1, c2) {
    return function() {
        return x.call(c1, y.apply(c2, arguments));
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
    string: ['o'],
    boolean: ['w', 'h', 'b']
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
    (function(r) {
        data = r[0];
        output = r[1];
        return r;
    })([null, null]);
    /*@26:5*/
    try {
        data = fs.readFileSync(file, 'utf-8');
    } catch (e) {
        return;
    };
    /*@29:5*/
    console.error(('Compiling ' + path.basename(file)) + '...');
    try {
        output = milk.compile(data, {
            wrapper: !argv.b
        });
    } catch (e1) {
        var message, offset, row, col;
        (function(r1) {
            message = r1.message;
            offset = r1.offset;
            return r1;
        })(e1);
        /*@36:9*/
        (function(r2) {
            row = r2[0];
            col = r2[1];
            return r2;
        })(helper.offsetToLinePos(offset, data));
        /*@37:9*/
        console.error((((message + ' @') + row) + ':') + col);
        return;
    };
    if (deststats == null) {
        /*@41:9*/
        console.log(output);
    } else {
        var dir, milkfile, r3;
        dir = p;
        /*@44:9*/
        if (stats.isFile()) {
            dir = path.dirname(p);
        };
        milkfile = compose(replaceMilk, (r3 = path).join, null, r3)(argv.o, path.relative(dir, file));
        /*@47:9*/
        fs.writeFileSync(milkfile, output);
    };
};

// Main
(function(r4) {
    p = (function() {
        var r5;
        r5 = r4[0];
        if (((typeof r5) === 'undefined') || (r5 == null)) {
            return './';
        };
        return r5;
    })();
    return r4;
})(argv._);
/*@52:1*/
(function(r6) {
    stats = r6[0];
    deststats = r6[1];
    return r6;
})([fs.statSync(p), argv.o ? fs.statSync(argv.o) : null]);
/*@53:1*/
files = [];
if ((deststats != null) && (!deststats.isDirectory())) {
    console.error('Invalid output.');
    /*@57:5*/
    return;
};
if (!argv.w) {
    var i2, l1, file, i;
    /*@60:5*/
    if (stats.isFile()) {
        files = [p];
    } else if (stats.isDirectory()) {
        files = readdirRecursive(p).filter(endsWithMilk);
    } else {
        /*@65:9*/
        console.error('Invalid input.');
        return;
    };
    l1 = files;
    for (i2 in l1) {
        file = l1[i2];
        i = parseInt(i2, 10);
        if (isNaN(i)) i = i2;
        var percent;
        /*@69:9*/
        compile(file);
        percent = Math.round(((i + 1) * 100) / files.length);
        console.error(percent + '%');
    };
} else {
    var lasttime, callback;
    /*@74:5*/
    lasttime = new Date();
    callback = function(event, file) {
        if (((!endsWithMilk(file)) || (event !== 'change')) || (((new Date()) - lasttime) <= 1000)) {
            /*@80:13*/
            return;
        };
        lasttime = new Date();
        compile(path.join(p, file));
        /*@84:9*/
        console.error('Done.');
    };
    fs.watch(p, {
        recursive: true
    }, callback);
};
})();
