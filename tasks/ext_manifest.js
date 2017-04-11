'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;
const replace = require('gulp-batch-replace');
const args = require('yargs').argv;

module.exports = function () {
    let phs = [];

    if (args.env === 'local') {
        extOpt.replace.REMOTE_API_URL = 'http://localhost:8181/api/';
    }

    Object.keys(extOpt.replace).forEach(function (ph) {
        phs.push([ph, extOpt.replace[ph]]);
    });

    return gulp
        .src(extOpt.manifest.json)
        .pipe(replace(phs))
        .pipe(gulp.dest(extOpt.dist));
};
