# cloudfront-invalidator-for-codepipeline
### Overview
This is an AWS Lambda function to be triggered by CodePipeline in a Lambda Node environment.

This Lambda function accomplishes two main goals:
* Invalidate the CloudFront Distribution of my last deployment
* Report the completion status of sending out the invalidation to CodePipeline

This code does _not_ report the status of the invalidation back to CodePipeline. It is assumed that CloudFront will handle invalidation properly after it receives the request.

### Wait but why?
My personal website (https://www.cjdocuyanan.com) is continuously deployed upon each commit and subsequent build, so I needed a way to invalidate my CloudFront CDNs so that new static assets will be reflected immediately. This was a top-of-mind solution for my use case, but see [alternatives](#alternatives) for other ideas on how to accomplish this.

## Setup
### Assumptions
* You are familiar with AWS CodePipeline, Lambda, IAM Roles & Permissions
* You have already built your pipeline and have a CloudFront distribution

### Lambda
1. Setup your Lambda function in the same region as your CodePipeline's region.
2. You will need to set the environment variable `DISTRIBUTION_ID` to your actual CloudFront distribution id
3. Make sure that your AWS Lambda's IAM permissions include the following actions. Be sure to also assign it to the correct resource ARN.
    ````
    "codepipeline:PutJobSuccessResult",
    "codepipeline:PutJobFailureResult"
    ````
    
### CodePipeline
1. Edit the Stage that you want the Lambda function to run in. This is likely in your Deploy Stage.
2. Click on Add Action. Action Provider should be AWS Lambda.

## Alternatives
### Amazon S3 Bucket Notifications
If you are setting up a CodePipeline and you are outputting the file(s) to Amazon S3, you could also use an S3 Bucket Notification to emit an event to AWS Lambda. 
