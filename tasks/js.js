'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const livereload = require('gulp-livereload');
const replace = require('gulp-batch-replace');

const config = require('./../gulp.conf');

module.exports = [[], function () {
    let phs = [];

    config.replace.GOOGLE_CLIENT_ID = config.oauth.google.clientId;
    config.replace.GOOGLE_API_KEY = config.oauth.google.apiKey;
    config.replace.FACEBOOK_APP_ID = config.oauth.facebook.appId;

    Object.keys(config.replace).forEach(function (ph) {
        phs.push([ph, config.replace[ph]]);
    });

    return gulp
        .src(config.jsSources)
        .pipe(concat(config.jsFile))
        .pipe(replace(phs))
        .pipe(gulp.dest(config.jsDir))
        .pipe(livereload());
}];
