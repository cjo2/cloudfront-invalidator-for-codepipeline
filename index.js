const aws = require('aws-sdk');

const cloudfront = new aws.CloudFront();
const codepipeline = new aws.CodePipeline();

/**
 * 
 * @param {*} jobId 
 * @returns {Promise} Promise object that returns an empty body if resolved. Error object will be passed in first argument if rejected.
 * {@link https://docs.aws.amazon.com/codepipeline/latest/APIReference/API_PutJobSuccessResult.html} for more information on errors.
 */
let codepipelineSuccess = (jobId) => {
    return new Promise((resolve, reject) => {
        codepipeline.putJobSuccessResult({ jobId }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        })
    });
}

/**
 * 
 * @param {*} jobId 
 * @param {*} error 
 * @param {*} awsRequestId 
 * @returns {Promise} Promise object that returns an empty body if resolved. Error object will be passed in first argument if rejected.
 * {@link https://docs.aws.amazon.com/codepipeline/latest/APIReference/API_PutJobFailureResult.html} for more information on errors.
 */
let codepipelineFail = (jobId, error, awsRequestId) => {
    return new Promise((resolve, reject) => {
        codepipeline.putJobFailureResult({
            jobId,
            failureDetails: {
                message: JSON.stringify(error),
                type: 'JobFailed',
                externalExecutionId: awsRequestId
            }
        }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        })
    });
}

/**
 * 
 * @param {*} distributionId 
 * @param {*} jobId 
 * @returns {Promise}
 * {@link https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_CreateInvalidation.html} for more information on createInvalidation implementation.
 */
let createInvalidation = (distributionId, jobId) => {
    return new Promise((resolve, reject) => {
        cloudfront.createInvalidation({
            'DistributionId': distributionId,
            'InvalidationBatch': {
                'CallerReference': jobId ? `CodePipeline - ${jobId}` : new Date().getTime().toString(),
                'Paths': {
                    'Items': ['/*'],
                    'Quantity': 1,
                }
            }
        }, (err, data) => {
            console.log(data);

            if (err) {
                reject(err);
                return;
            }

            resolve(data);
        });
    });
}

/**
 * 
 * @param {*} event 
 * @param {*} context 
 * @returns {Object} Returns an object with a status code
 */
exports.handler = async (event, context) => {

    // Validate that we have the variables we need
    if (!event['CodePipeline.job'] && !event['CodePipeline.job'].id) {
        return {
            status: 400,
            error: {
                message: 'CodePipeline Job ID not provided in the event argument.'
            }
        }
    }

    if (!process.env.DISTRIBUTION_ID) {
        return {
            status: 400,
            error: {
                message: 'Environment variable DISTRIBUTION_ID not found.'
            }
        }
    }

    let jobId = event['CodePipeline.job'].id;

    try {
        const invalidationResponse = await createInvalidation(process.env.DISTRIBUTION_ID);
        await codepipelineSuccess(jobId);

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


