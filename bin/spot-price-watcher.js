#!/usr/bin/env node

const minimist = require('minimist');
const SpotPriceWatcher = require('../index');
const argv = minimist(process.argv.slice(2));
const opts = require('./opts')(argv, process.cwd());

if (opts.help) {
    /* eslint-disable no-console */
    console.log(`
        spotprice [--regions target regions default 'all'] [--type target instance type default 'c4.large']
        spotprice --regions us --regions eu-west
        spotprice --type g2.2xlarge
        spotprice --spotpricerc example/dir/.spotpricerc
`);
    /* eslint-enable no-console */
    process.exit(0);
}

const watcher = new SpotPriceWatcher(opts);
watcher.execute();
watcher.on('exit', () => {
    process.exit(0);
});
