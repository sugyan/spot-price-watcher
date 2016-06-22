/* eslint-disable no-console */

'use strict';

const PriceCollector = require('./lib/aws/price_collector');
const x256 = require('x256');

const collector = new PriceCollector();

collector.fetchPrices().then((results) => {
    const data = {};
    results.forEach((result) => {
        result.SpotPriceHistory.forEach((history) => {
            if (! data[history.AvailabilityZone]) {
                data[history.AvailabilityZone] = [];
            }
            data[history.AvailabilityZone].push(history);
        });
    });

    const now = new Date().getTime();
    const x = Array.from(Array(60), (_, i) => new Date(now - 1000 * 60 * (60 - i - 1)));
    const series = Object.keys(data).map((zone) => {
        return {
            title: `${zone}: ${data[zone][0].SpotPrice}`,
            x: x.map((t) => `${t.getHours()}:${(t.getMinutes() < 10 ? '0' : '') + t.getMinutes()}`),
            y: x.map((t) => {
                const v = data[zone].find((history) =>  history.Timestamp < t).SpotPrice;
                if (v < 0.2) {
                    return v;
                } else {
                    return undefined;
                }
            }),
            style: {
                line: x256.apply(null, Array.from(Array(3), () => Math.floor(Math.random() * 255)))
            }
        };
    });

    const blessed = require('blessed');
    const contrib = require('blessed-contrib');
    const screen = blessed.screen();

    const line = contrib.line({
        style: {
            text: 'green',
            baseline: 'white'
        },
        showLegend: true,
        legend: {
            width: 25
        },
        minY: 0.1,
        label: 'Price'
    });
    screen.append(line);
    line.setData(series);

    screen.key(['escape', 'q', 'C-c'], () => {
        return process.exit(0);
    });
    screen.render();
}).catch((error) => {
    console.error(error);
});
