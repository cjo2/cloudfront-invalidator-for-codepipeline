# cloudfront-invalidator-for-codepipeline
This is an AWS Lambda function to be triggered by CodePipeline in a Lambda Node environment.

Given that my personal website (https://www.cjdocuyanan.com) is continuously deployed upon each commit and subsequent build, I needed a way to invalidate my CloudFront CDNs so that new static assets will be reflected immediately. This Lambda function accomplishes two main goals:
* Invalidate the CloudFront Distribution of my last deployment
* Report the completion status of sending out the invalidation to CodePipeline

This code does _not_ report the status of the invalidation to CodePipeline. It is assumed that CloudFront will handle invalidation properly after it receives the request.

## Setup
### AWS Lambda

1. You will need to set the environment variable `DISTRIBUTION_ID` to your actual CloudFront distribution id
2. Make sure that your AWS Lambda's IAM permissions include the following actions. Be sure to also assign it to the correct resource ARN.
    ````
    "codepipeline:PutJobSuccessResult",
    "codepipeline:PutJobFailureResult"
    ````

## Notes

### Amazon S3 Bucket Notifications
If you are setting up a CodePipeline and you are outputting the file(s) to Amazon S3, you could also use an S3 Bucket Notification to emit an event to AWS Lambda. 
