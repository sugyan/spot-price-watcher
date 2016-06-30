'use strict';

const AWS = require('aws-sdk');

class PriceCollector {
    constructor() {
        this.target_regions = [
            'eu-west-1',
            'us-east-1',
            'us-west-1',
            'us-west-2'
        ];
        this.default_params = {
            InstanceTypes: ['g2.2xlarge'],
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
