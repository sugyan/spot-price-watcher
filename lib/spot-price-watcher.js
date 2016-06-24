'use strict';

const PriceCollector = require('./aws/price_collector');
const EventEmitter = require('events').EventEmitter;
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');
const x256 = require('x256');

class SpotPriceWatcher extends EventEmitter {
    execute() {
        // setup screen and linechart
        this.range = [0.1, 0.2];
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
                width: 27
            },
            label: 'Price'
        });
        this.screen.append(this.line);

        // fetch price histories and render
        this.fetchPrices().then(() => {
            this.colors = Object.keys(this.data).map(() => {
                const color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
                if (Math.max.apply(null, color) < 128) {
                    color[Math.floor(Math.random() * 3)] += 128;
                }
                return color;
            });
        }).then(() => {
            this.render();
        });
    }
    fetchPrices() {
        return new Promise((resolve) => {
            const collector = new PriceCollector();
            collector.fetchPrices().then((results) => {
                const now = moment();
                this.x = Array.from(Array(60), (_, i) => now.clone().subtract(60 - i - 1, 'minute').toDate());
                this.data = {};
                results.forEach((result) => {
                    result.SpotPriceHistory.forEach((history) => {
                        if (! this.data[history.AvailabilityZone]) {
                            this.data[history.AvailabilityZone] = [];
                        }
                        this.data[history.AvailabilityZone].push(history);
                    });
                });
                resolve();
            });
        });
    }
    render() {
        this.line.options.minY = this.range[0];
        this.line.options.maxY = this.range[1];
        const series = Object.keys(this.data).sort().map((zone, i) => {
            return {
                title: `${zone}: ${this.data[zone][0].SpotPrice}`,
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
                    line: x256(this.colors[i])
                }
            };
        });
        this.line.setData(series);
        this.screen.render();
    }
}

module.exports = SpotPriceWatcher;
