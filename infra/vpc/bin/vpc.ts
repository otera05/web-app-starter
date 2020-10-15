#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { VpcStack } from "../lib/vpc-stack";

const app = new cdk.App();
const env: string = app.node.tryGetContext("env") || "Stg";
const stackPrefix: string = `TodonParty`;
const cdkName: string = "VPC";
const stackName: string = `${stackPrefix}-${env}-${cdkName}`;
new VpcStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
