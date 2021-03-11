const aws = require('aws-sdk');
const cloudfront = new aws.CloudFront();


exports.handler = async (event) => {
    
    try {
        const invalidationResponse = await new Promise((resolve, reject) => {
            cloudfront.createInvalidation({
                'DistributionId': process.env.DISTRIBUTION_ID,
                'InvalidationBatch': {
                    'CallerReference': new Date().getTime().toString() + '-CODEPIPELINE',
                    'Paths': {
                        'Items': ['/*'],
                        'Quantity': 1,
                    }
                }
            }, (err, data) => {
                console.log(data);
        
                if (err) {
                    reject(err);
                    return; // TODO check if reject() returns a Promise
                }
        
                resolve(data);
            });
        });
        
        return {
            status: 200,
            data: invalidationResponse
        }
    } catch (error) {
        console.error(error);
        return {
            status: 400,
            error: error
        }
    }
    
};
