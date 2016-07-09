'use strict';
const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');

const regions = {
    'us-east-1': 'us-east-1',
    'us-west-1': 'us-west-1',
    'us-west-2': 'us-west-2',
    'eu-west-1': 'eu-west-1',
    'eu-central-1': 'eu-central-1',
    'ap-northeast-1': 'ap-northeast-1',
    'ap-northeast-2': 'ap-northeast-2',
    'ap-southeast-1': 'ap-southeast-1',
    'ap-southeast-2': 'ap-southeast-2',
    'sa-east-1': 'sa-east-1',
    // aliases
    'us-east': ['us-east-1'],
    'us-west': ['us-west-1', 'us-west-2'],
    'eu-west': ['eu-west-1'],
    'eu-central': ['eu-central-1'],
    'ap-northeast': ['ap-northeast-1', 'ap-northeast-2'],
    'ap-southeast': ['ap-southeast-1', 'ap-southeast-2'],
    'sa-east': ['sa-east-1'],
    'us': ['us-east', 'us-west'],
    'eu': ['eu-west', 'eu-central'],
    'ap': ['ap-northeast', 'ap-southeast'],
    'sa': ['sa-east'],
    'all': ['us', 'eu', 'ap', 'sa']
};

const opts = (argv, cwd) => {
    const rcFile = argv.spotpricerc || path.join(cwd, '.spotpricerc');
    let rc = {};
    try {
        fs.statSync(rcFile);
        rc = JSON5.parse(fs.readFileSync(rcFile).toString());
    } catch (err) {
        // noop
    }

    // instance type
    const instance_type = argv.type || rc.type || 'c4.large';
    // regions
    const retrieve_region = (code) => {
        if (regions[code]) {
            if (Array.isArray(regions[code])) {
                return Array.prototype.concat.apply([], regions[code].map((e) => retrieve_region(e)));
            } else {
                return [regions[code]];
            }
        } else {
            return [];
        }
    };
    if (! argv.regions) {
        argv.regions = rc.regions || 'all';
    }
    const target_regions = Array.prototype.concat.apply(
        [],
        (Array.isArray(argv.regions) ? argv.regions : [argv.regions]).map((code) => retrieve_region(code))
    );

    return {
        target_regions: target_regions,
        instance_type: instance_type,
        help: argv.help || argv.h
    };
};
module.exports = opts;
