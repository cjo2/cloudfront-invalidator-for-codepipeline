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
 * 
 * @param {*} jobId 
 * @returns {Promise}
 * {@link https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_CreateInvalidation.html} for more information on createInvalidation implementation.
 */
let createInvalidation = (distributionId, jobId, items) => {
    return new Promise((resolve, reject) => {
        cloudfront.createInvalidation({
            'DistributionId': distributionId,
            'InvalidationBatch': {
                'CallerReference': jobId,
                'Paths': {
                    'Items': items,
                    'Quantity': items.length,
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

    const jobId = event['CodePipeline.job'].id;
    const invalidationConfigString = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters;
    const { distributionId, items } = JSON.parse(invalidationConfigString);

    if (!distributionId) {
        return {
            status: 400,
            error: {
                message: 'User parameter "distributionId" not found.',
            }
        }
    }

    if(!items || items.length === 0) {
        return {
            status: 400,
            error: {
                message: 'User parameter "items" is missing or has no paths.',
            }
        }
    }


    try {
        const invalidationResponse = await createInvalidation(distributionId, jobId, items);
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


