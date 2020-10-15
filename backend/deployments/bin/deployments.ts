#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CdkStack } from "../lib/cdk-stack";

const app = new cdk.App();
const env: string = app.node.tryGetContext("env") || "Demo";
const stackPrefix: string = "TodonParty";
const cdkName: string = "Backend";
const stackName: string = `${stackPrefix}-${env}-${cdkName}`;
new CdkStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
