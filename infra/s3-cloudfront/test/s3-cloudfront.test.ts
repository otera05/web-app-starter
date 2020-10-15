import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as S3Cloudfront from '../lib/s3-cloudfront-stack';

test('Snapshot Test', () => {
  const account: string = '000000000000';
  const region: string = 'ap-northeast-1';
  const context: any = {
    description: 'description',
    domainName: 'miniapp.test.lycle-line.jp',
    s3: {
      bucketName: 'miniapp.test.lycle-line.jp',
      name: 's3-cloudfront-miniapp_Bucket',
    },
    cloudFront: {
      distributionId: 's3-cloudfront-miniapp_Distribution',
      oaiId: 's3-cloudfront-miniapp_S3',
      acmArn:
        'arn:aws:acm:ap-northeast-1:000000000000:certificate/ffffffff-ffff-ffff-ffff-ffffffffffff',
      domainName: 'miniapp.test.lycle-line.jp',
    },
    route53: {
      id: 's3-cloudfront-miniapp_Route53',
      hostedZone: {
        id: 'Z000000000AAAAAAA0AA0',
        domainName: 'test.lycle-line.jp',
      },
    },
  };
  const app: cdk.App = new cdk.App({
    context: { env: 'Test', Test: JSON.stringify(context) },
  });
  const stack = new S3Cloudfront.S3CloudfrontStack(app, 'TestStack', {
    env: { account, region },
  });
  const cfn: any = SynthUtils.toCloudFormation(stack);
  expect(cfn).toMatchSnapshot();
});
