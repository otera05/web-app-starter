import * as cdk from '@aws-cdk/core';
import { SynthUtils } from '@aws-cdk/assert';
import { VpcStack } from '../lib/vpc-stack';

test('Snapshot Test', () => {
  const account: string = '000000000000';
  const region: string = 'ap-northeast-1';
  const context: any = {
    description: '',
    vpc: {
      name: 'vpc-demo-mini-app',
      cidr: '10.3.0.0/16',
    },
    igw: {
      name: 'igw-demo-mini-app',
    },
    subnet: {
      public: [
        {
          name: 'public-sub-demo-mini-app-a',
          availabilityZone: 'ap-northeast-1a',
          cidrBlock: '10.3.0.0/24',
        },
      ],
    },
  };
  const app = new cdk.App({
    context: { env: 'Test', Test: JSON.stringify(context) },
  });
  const stack = new VpcStack(app, 'TestStack', {
    env: { account, region },
  });
  const cfn = SynthUtils.toCloudFormation(stack);
  expect(cfn).toMatchSnapshot();
});
