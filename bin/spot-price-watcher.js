#!/usr/bin/env node

const SpotPriceWatcher = require('../index');
const watcher = new SpotPriceWatcher();
watcher.execute();
watcher.on('exit', () => {
    process.exit(0);
});
