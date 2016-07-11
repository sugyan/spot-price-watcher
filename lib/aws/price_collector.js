'use strict';

const AWS = require('aws-sdk');

class PriceCollector {
    constructor(target_regions, instance_type) {
        this.target_regions = target_regions;
        this.default_params = {
            InstanceTypes: [instance_type],
            ProductDescriptions: ['Linux/UNIX']
        };
    }
    getSpotPriceHistory(region, start_time)  {
        const ec2 = new AWS.EC2({ region: region });
        return new Promise((resolve, reject) => {
            const params = Object.assign({}, this.default_params);
            params.StartTime = start_time;
            ec2.describeSpotPriceHistory(params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }
    fetchPrices(start_time) {
        const promises = this.target_regions.map((region) => this.getSpotPriceHistory(region, start_time));
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
