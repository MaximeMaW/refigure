'use strict';

const AWS = require('aws-sdk');
const constants = require('./const');
const config = require('js.shared').config;

let _store = {};

exports.load = load;
exports.store = _store;

function load() {
    let awsCfg = config.get('aws');
    if (awsCfg.profile) {
        let credentials = new AWS.SharedIniFileCredentials({
            profile: awsCfg.profile
        });

        AWS.config.update({
            credentials: credentials
        });
    }

    AWS.config.update({
        region: awsCfg.region
    });
    let ssm = new AWS.SSM();
    let request = {
        Names: [],
        WithDecryption: true
    };
    Object.keys(constants.AWS.PARAMS).forEach((key) => {
        request.Names.push(constants.AWS.PARAMS[key]);
        //_store[constants.AWS.PARAMS[key]] = config.get(constants.AWS.PARAMS[key]);
    });

    ssm.getParameters(request, (err, data) => {
        if (err) {
            console.log('AWS parameters storage fail', err);
        } else {
            data.Parameters.forEach((param) => {
                _store[param.Name] = param.Value;
            });
            console.log('argv', _store);
        }
    });
}
