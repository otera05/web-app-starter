#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { S3CloudfrontStack } from "../lib/s3-cloudfront-stack";

const app = new cdk.App();
const env: string = app.node.tryGetContext("env") || "Demo";
const stackPrefix: string = `TodonParty`;
const cdkName: string = "S3CloudFront";
const stackName: string = `${stackPrefix}-${env}-${cdkName}`;
new S3CloudfrontStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
