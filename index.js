var ronin = require('ronin'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

var program = ronin({
    fatch: function () {
        return 'horst';
    },
    options: {
        file: {
            type: 'string'
        },
        repo: 'string',
        rev: {
            type: 'string',
            default: 'HEAD'
        }
    },
    desc: 'Shows statistics based on git blame for a specific file'
});

// extend program
program.getParams = function (options) {
    var filepath = path.resolve(process.env.PWD, options.file),
        base = path.dirname(filepath),
        file = path.basename(filepath),
        gitroot,
        next = base;

    function find (filepath) {
        var gitpath = path.join(filepath, '.git'),
            stats;
        if (!fs.existsSync(gitpath)) return;

        stats = fs.statSync(gitpath);
        if (!stats.isDirectory()) return;

        return gitpath;
    }

    // closet .git directory
    while (!gitroot && next !== '/') {
        gitroot = find(next);
        next = path.join(next, '..');
    }

    return _.extend(
            {},
            this.global,
            {
                base: base,
                file: file,
                gitroot: gitroot
            });
};

// init shared variables
//program.set('params', program.getParams());

program.run();
