'use strict';

const params = require('../back/parameters');

module.exports = function (cb) {
    params.load(() => {
        cb();
    });
};
