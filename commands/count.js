var Command = require('ronin').Command;

var util = require('../lib/util');
var _ = require('lodash'),
    path = require('path');

var Count = Command.extend({
    desc: 'Cou!nt statistics',
    run: function () {
        var self = this,
            opt = self.program.getParams(this.global);

        // get global options
        var file = this.global.file,
            rev = this.global.rev,
            repo = this.global.repo;
        // get full path to file
        file = path.join(process.env.PWD, file);
        // get git base path (if not defined)
        repo = repo || opt.gitroot;
        util.fetch(file, rev, repo).then(self.map.bind(self));
    },
    map: function (data) {
        var hash = {},
            list = [];

        // TODO: https://github.com/alessioalex/git-authors
        // map: author / lines
        data.commits.forEach(function (data) {
            hash[data.mail] = hash[data.mail] || {
                percent: 0,
                name: data.author,
                // commits
                detail: 0
            };
            hash[data.mail].percent = hash[data.mail].percent + data.linespercent;
            hash[data.mail].detail = hash[data.mail].detail + 1;
        });

        // fix percent and hash to list
        _.each(hash, function (obj) {
            obj.percent = obj.percent.toFixed(1);
            list.push(obj);
        });

        util.print(list);
    }
});

module.exports = Count;
