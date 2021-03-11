# AWS CodePipeline CloudFront Invalidator
This is boilerplate code to be triggered by CodePipeline in a Lambda Node environment.

Given that my personal website (https://www.cjdocuyanan.com) is continuously deployed upon each commit and subsequent build, I needed a way to invalidate my CloudFront CDNs so that new static assets will be reflected immediately. This Lambda function accomplishes two main goals:
* Invalidate the CloudFront Distribution of my last deployment
* Report the completion status of sending out the invalidation to CodePipeline

This code does NOT report the status of the invalidation to CodePipeline. It is assumed that CloudFront will handle invalidation properly after it receives the request.

## Setup
You will need to set the environment variable DISTRIBUTION_ID to your actual CloudFront distribution id
