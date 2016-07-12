'use strict';

const PriceCollector = require('./aws/price_collector');
const EventEmitter = require('events').EventEmitter;
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');
const sprintf = require('sprintf-js').sprintf;
const x256 = require('x256');

class SpotPriceWatcher extends EventEmitter {
    constructor(opts) {
        super();
        this.opts = opts;
        this.collector = new PriceCollector(opts.target_regions, opts.instance_type);
        this.colors = [
            [0xff, 0x80, 0x80],
            [0xff, 0xbf, 0x80],
            [0xff, 0xff, 0x80],
            [0xbf, 0xff, 0x80],
            [0x80, 0xff, 0x80],
            [0x80, 0xff, 0xbf],
            [0x80, 0xff, 0xff],
            [0x80, 0xbf, 0xff],
            [0x80, 0x80, 0xff],
            [0xbf, 0x80, 0xff],
            [0xff, 0x80, 0xff],
            [0xff, 0x80, 0xbf]
        ];
    }
    execute() {
        // setup screen and linechart
        this.range = undefined;
        this.screen = blessed.screen();
        this.screen.key(['escape', 'q', 'C-c'], () => {
            this.emit('exit');
        });
        this.screen.key(['r'], () => {
            this.fetchPrices().then(() => {
                this.render();
            });
        });
        this.screen.key(['up', 'C-p'], () => {
            const d = this.range[1] - this.range[0];
            this.range[0] -= d * 0.2;
            this.range[1] -= d * 0.2;
            this.render();
        });
        this.screen.key(['down', 'C-n'], () => {
            const d = this.range[1] - this.range[0];
            this.range[0] += d * 0.2;
            this.range[1] += d * 0.2;
            this.render();
        });
        this.screen.key(['+'], () => {
            const d = this.range[1] - this.range[0];
            this.range[1] = this.range[0] + d / 2.0;
            this.render();
        });
        this.screen.key(['-'], () => {
            const d = this.range[1] - this.range[0];
            this.range[1] = this.range[0] + d * 2.0;
            this.render();
        });
        this.line = contrib.line({
            style: {
                baseline: 'white'
            },
            showLegend: true,
            legend: {
                width: Math.max.apply(null, this.collector.target_regions.map((e) => e.length)) + 12
            },
            label: `Price of ${this.opts.instance_type}`
        });
        this.screen.append(this.line);

        // fetch price histories and render
        this.fetchPrices().then(() => this.render());

        if (this.opts.auto_refresh) {
            setInterval(() => {
                this.fetchPrices().then(() => this.render());
            }, this.opts.auto_refresh * 1000 * 60);
        }
    }
    fetchPrices() {
        return new Promise((resolve) => {
            this.collector.fetchPrices(moment().subtract(1, 'hour').toDate()).then((results) => {
                const range = [Infinity, -Infinity];
                const now = moment();
                this.x = Array.from(Array(60), (_, i) => now.clone().subtract(60 - i - 1, 'minute').toDate());
                this.data = {};
                results.forEach((result) => {
                    result.SpotPriceHistory.forEach((history) => {
                        if (! this.data[history.AvailabilityZone]) {
                            this.data[history.AvailabilityZone] = [];
                        }
                        this.data[history.AvailabilityZone].push(history);
                        range[0] = Math.min(range[0], history.SpotPrice);
                        range[1] = Math.max(range[1], history.SpotPrice);
                    });
                });
                if (this.range === undefined) {
                    range[1] *= 1.01;
                    this.range = range;
                }
                resolve();
            });
        });
    }
    render() {
        this.line.options.minY = this.range[0];
        this.line.options.maxY = this.range[1];
        const series = Object.keys(this.data).sort().map((zone, i) => {
            return {
                title: sprintf('%s: %.4f', zone, this.data[zone][0].SpotPrice),
                x: this.x.map((t) => moment(t).format('HH:mm')),
                y: this.x.map((t) => {
                    const v = this.data[zone].find((history) =>  history.Timestamp < t).SpotPrice;
                    if (v > this.range[0] && v < this.range[1]) {
                        return v;
                    } else {
                        return undefined;
                    }
                }),
                style: {
                    line: i < this.colors.length ? x256(this.colors[i]) : x256([0xff, 0xff, 0xff])
                }
            };
        });
        this.line.setData(series);
        this.screen.render();
    }
}

module.exports = SpotPriceWatcher;
