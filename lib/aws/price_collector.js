'use strict';

const AWS = require('aws-sdk');

class PriceCollector {
    constructor(target_regions, instance_type) {
        this.target_regions = target_regions;
        this.default_params = {
            InstanceTypes: [instance_type],
            ProductDescriptions: ['Linux/UNIX'],
            StartTime: new Date(new Date() - 1000 * 60 * 60)
        };
    }
    getSpotPriceHistory(region)  {
        const ec2 = new AWS.EC2({ region: region });
        return new Promise((resolve, reject) => {
            ec2.describeSpotPriceHistory(this.default_params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }
    fetchPrices() {
        const promises = this.target_regions.map((region) => this.getSpotPriceHistory(region));
        return new Promise((resolve, reject) => {
            Promise.all(promises).then((results) => {
                resolve(results);
            }).catch((error) => {
                reject(error);
            });
        });
    }
}

module.exports = PriceCollector;
