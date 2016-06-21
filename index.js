/* eslint-disable no-console */
const PriceCollector = require('./lib/aws/price_collector');

const collector = new PriceCollector();
collector.fetchPrices().then((results) => {
    results.forEach((result) => {
        console.log(result);
    });
}).catch((error) => {
    console.error(error);
});
