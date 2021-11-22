# CloudFront Invalidator (for CodePipeline)
### Overview
This is an AWS Lambda function to be triggered by CodePipeline in a Lambda Node environment. It is deployable using AWS SAM CLI.

This Lambda function creates a CloudFront Invalidation so that your distibution is updated with the latest objects the next time those edge location's objects are requested again.

This code does _not_ report the actual status of the invalidation back to CodePipeline. It is assumed that CloudFront will handle invalidation properly after it receives the request.

### Wait but why?
My personal website (https://www.cjdocuyanan.com) is continuously deployed to Amazon S3 upon each commit and subsequent build, so I needed a way to invalidate my CloudFront CDNs so updated static assets will be reflected immediately. This was a top-of-mind solution for my use case, but see [alternatives](#alternatives) for other ideas on how to accomplish this.

NOTE - If you are using this because you are not using versioned hashes in your filenames, know that the AWS' documentation [does not recommend updating existing content with the same file names](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/UpdatingExistingObjects.html).

## Setup
### Assumptions
* You are familiar with AWS Serverless Application Model (SAM) and you have it installed and configured
* You have already configured your CodePipeline pipeline
* You have an existing CloudFront distribution

### Installation
1. Clone this repository on your local machine
2. Navigate to this directory in your terminal
3. Run `sam deploy --guided` and follow the steps. This application must be deployed to the same region as your CodePipeline.
    
### CodePipeline
1. Edit the Stage that you want the Lambda function to run in. This is likely in your deployment stage.
2. Click on Add Action. Action Provider should be AWS Lambda.
3. Locate the function under the 'Function name' input field.
4. In User Parameters, create a JSON-formatted string with the keys `distributionId` and `items`. 
   * `items` should be an array with one or more file paths that you would like to invalidate.
   * `distributionId` should be your CloudFront distribution's id

#### Example
```json
{"distributionId": "1234567890", "items":["/*"]}
```

## Alternatives
If you need to invalidate assets from CodePipeline, here are other options I explored before taking the AWS Lambda route.

### Amazon S3 Bucket Notifications
If you are setting up a CodePipeline and you are outputting the file(s) to Amazon S3, you could also use an S3 Bucket Notification to emit an event to AWS Lambda. Note that you are charged for each path invalidation, not the amount of files you invalidate, so consider this when creating your file invalidations via a Bucket Notification.

### Invalidate from buildspec.yml
If you are deploying your assets within your buildspec, you may also simply call `aws cloudfront create-invalidation` [see more](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html).
