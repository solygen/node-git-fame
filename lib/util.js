var deferred = require('deferred');
var _ = require('lodash');

module.exports = {

    fetch: function (file, rev, repo) {
        var def = deferred();

        // libs
        var gitblame = require('git-blame'),
            path = require('path'),
            _ = require('lodash');

        // datacd
        // cd
        var hash = {},
            lines = {},
            data = {
                commits: [],
                lines: 0
            };

        function readstream (type, data) {
            // type can be 'line' or 'commit'
            if (type === 'commit') {
                var obj = {
                    hash: data.hash,
                    author: (data.author || data.committer).name,
                    mail: (data.author || data.committer).mail,
                    timestamp: data.author.timestamp,
                    summary: data.summary
                };
                hash[data.hash] = hash[data.hash] || obj;
            } else {
                lines[data.hash] = (lines[data.hash] || 0) + 1;
            }
        }

        function error (err) {
            console.error(err.message);
            process.exit(1);
        }

        function finalize () {
            var keys = Object.keys(hash);

            // compact
            keys.forEach(function (key) {
                var commitlines = lines[key];
                // line sum
                data.lines = data.lines + commitlines;
                // extend commit data
                hash[key].lines = commitlines;
                data.commits.push(hash[key]);
            });

            // percent lines of commit vs. lines of file
            keys.forEach(function (key) {
                hash[key].linespercent = hash[key].lines * 100 / data.lines;
            });

            def.resolve(data);
        }

        gitblame(repo, {
            file: file,
            rev: rev
        })
        .on('data', readstream)
        .on('error', error)
        .on('end', finalize);

        return def.promise();
    },
    print: function (list) {

        list = _.sortBy(list, function (item) {return parseFloat(item.percent); }).reverse();

        _.each(list, function (item) {
            var str = item.percent.toString();
            // indent
            while (str.length < 4 )
                str = ' ' + str;

            console.log(str + ': ' + item.name +  (item.detail ? ' (' + item.detail + ')' : ''));
        });
    }
};
