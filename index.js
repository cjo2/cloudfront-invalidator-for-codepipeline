const aws = require('aws-sdk');
const cloudfront = new aws.CloudFront();
const codepipeline = new aws.CodePipeline();

let codepipelineSuccess = (jobId, message) => {
    return new Promise((resolve, reject) => {
        codepipeline.putJobSuccessResult({ jobId },(err, data) => {
            if(err) {
                reject(err);
                return;
            }
            resolve(data)
        })
    });
}

let codepipelineFail = (jobId, error, awsRequestId) => {
    return new Promise((resolve, reject) => {
        codepipeline.putJobFailureResult({
            jobId,
            failureDetails: {
                message: JSON.stringify(error),
                type: 'JobFailed',
                externalExecutionId: awsRequestId
            }
        })
    });
}

let createInvalidation = distributionId => {
    return new Promise((resolve, reject) => {
        cloudfront.createInvalidation({
            'DistributionId': distributionId,
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
}


exports.handler = async (event, context) => {

    let jobId = event['CodePipeline.job']? event['CodePipeline.job'].id : 'STUBID';

    try {
        const invalidationResponse = await createInvalidation(process.env.DISTRIBUTION_ID);
        await codepipelineSuccess(jobId, invalidationResponse);
        
        return {
            status: 200,
            data: invalidationResponse
        }
    } catch (error) {
        
        await codepipelineFail(jobId, error, context.awsRequestId);

        return {
            status: 400,
            error: error
        }
    }
    
};


