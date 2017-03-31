'use strict';

let argv = require('yargs').argv;

let stage = argv.stage || 'dev';
let region = argv.region || 'us-east-1';
let buildDir = 'build';
let clientDir = './front';
let tmpDir = 'tmp';
let bowerDir = './bower_components';
let angularMaterialDir = bowerDir + '/angular-material';
let restApiUri = argv.api || '/api';
let extDir = './ext';
let extSrcDir = extDir + '/src';

module.exports = {
    stage: stage,
    profile: argv.profile || 'default',
    region: region,
    server: {
        lrPort: 35729
    },

    replace: [],

    buildDir: buildDir,
    clientDir: clientDir,
    tmpDir: tmpDir,
    bowerDir: bowerDir,

    sassInc: [
        bowerDir,
        angularMaterialDir
    ],

    jsDir: buildDir + '/js',
    jsSources: [
        clientDir + '/app/**/*.module.js',
        clientDir + '/app/**/*.routes.js',
        clientDir + '/app/**/*.js'
    ],
    jsFile: 'app.js',
    jsFileMin: 'app.min.js',
    jsLibFile: 'libs.js',
    jsLibFileMin: 'libs.min.js',

    cssDir: buildDir + '/css',
    cssSources: [
        clientDir + '/assets/sass/main.sass'
    ],
    cssFile: 'app.css',
    cssFileMin: 'app.min.css',
    cssLibFile: 'libs.css',
    cssLibFileMin: 'libs.min.css',

    imgSources: [
        clientDir + '/assets/img/**/*.{png,gif,jpg,svg,ico}'
    ],
    imgDir: buildDir + '/img',

    fontDir: buildDir + '/fonts',
    fontSources: [
        clientDir + '/assets/fonts/**/*.*'
    ],

    htmSources: [
        clientDir + '/app/**/*.html'
    ],
    htmDir: buildDir + '/view',
    viewFileMin: 'partials.min.js',
    indexSource: clientDir + '/index.html',
    indexHtml: buildDir + '/index.html',
    extension: {
        replace: {
            'REMOTE_API_URL': 'https://refigure.noblecoz.com/api/'
        },
        src: extSrcDir,
        dist: extDir + '/dist',
        common: {
            css: extSrcDir + '/common/variables.sass',
            js: extSrcDir + '/common/const.js'
        },
        content: {
            html: extSrcDir + '/content/templates/**/*.html',
            css: extSrcDir + '/content/content.sass',
            mainScripts: [
                extSrcDir + '/vendor/sizzle/sizzle.min.js',
                extSrcDir + '/vendor/angular/angular.min.js',
                extSrcDir + '/common/const.js',
                extSrcDir + '/content/content.js',
                extSrcDir + '/content/dialog.js'
            ],
            parsers: extSrcDir + '/content/parsers/*.js'
        },
        background: {
            dir: '/background',
            html: extSrcDir + '/background/background.html',
            js: [
                extSrcDir + '/common/const.js',
                extSrcDir + '/background/background.js'
            ]
        },
        manifest: {
            json: extSrcDir + '/manifest.json'
        },
        popup: {
            js: [
                extSrcDir + '/vendor/angular/angular.min.js',
                extSrcDir + '/vendor/angular/angular-route.min.js',
                extSrcDir + '/vendor/angular/angular-sanitize.min.js',
                extSrcDir + '/common/const.js',
                extSrcDir + '/popup/*.module.js',
                extSrcDir + '/popup/**/*.js'
            ],
            html: extSrcDir + '/popup/**/!(*popup).html',
            css: extSrcDir + '/popup/**/*.sass',
            index: extSrcDir + '/popup/popup.html'
        }
    }
};
