#!/usr/bin/env node

const minimist = require('minimist');
const SpotPriceWatcher = require('../index');
const argv = minimist(process.argv.slice(2));
const opts = require('./opts')(argv, process.cwd());

const watcher = new SpotPriceWatcher(opts);
watcher.execute();
watcher.on('exit', () => {
    process.exit(0);
});
