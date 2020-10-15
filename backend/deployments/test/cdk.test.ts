import * as cdk from '@aws-cdk/core';
import { SynthUtils } from '@aws-cdk/assert';
import * as Deployments from '../lib/cdk-stack';

test('Snapshot Test', () => {
  const account: string = '000000000000';
  const region: string = 'ap-northeast-1';
  const context: any = {
    description: 'description',
    network: {
      vpcName: 'vpc-fffffffffffffffff',
      publicSubnets: [
        {
          subnetId: 'subnet-ffffffffffffffff1',
          availabilityZone: 'ap-northeast-1a',
          routeTableId: 'rtb-ffffffffffffffff1',
        },
        {
          subnetId: 'subnet-ffffffffffffffff2',
          availabilityZone: 'ap-northeast-1c',
          routeTableId: 'rtb-ffffffffffffffff2',
        },
      ],
      securityGroup: {
        id: 'sg-sgsgsgsgsgsgsgsg',
        name: 'test-lycleline-ecs-miniapp',
      },
      targetGroupArn:
        'arn:aws:elasticloadbalancing:ap-northeast-1:000000000000:targetgroup/hoge',
    },
    container: {
      hostPort: 8080,
      containerPort: 8080,
      memoryLimitMiB: 512,
      cpu: 256,
      desiredCount: 1,
      imageName: 'mini-app',
      assignPublicIp: true,
      env: {},
    },
    loadBalancer: {
      alb: {
        id: 'demo-miniapp-alb',
        name: 'demo-miniapp-alb',
      },
      targetGroup: {
        healthCheck: {
          statusCode: '200',
        },
        port: 80,
        name: 'demo-miniapp-alb-tg',
      },
      listener: {
        http: {
          id: 'demo-miniapp-listener-http',
          port: 80,
        },
        https: {
          id: 'demo-miniapp-listener-https',
          port: 443,
          certificateArn:
            'arn:aws:acm:ap-northeast-1:000000000000:certificate/ffffffff-ffff-ffff-ffff-000000000000',
        },
      },
    },
    route53: {
      id: 'miniapp-alb-Route53',
      fqdn: 'api.miniapp.demo.lycle-line.jp',
      hostedZone: {
        id: 'miniapp-alb-HostedZone',
        domainName: 'demo.lycle-line.jp.',
      },
    },
  };
  const app = new cdk.App({
    context: { env: 'Test', Test: JSON.stringify(context) },
  });
  const stack = new Deployments.CdkStack(app, 'TestStack', {
    env: { account, region },
  });
  const cfn = SynthUtils.toCloudFormation(stack);
  expect(cfn).toMatchSnapshot();
});
