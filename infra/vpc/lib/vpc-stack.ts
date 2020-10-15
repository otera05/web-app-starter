import * as ec2 from '@aws-cdk/aws-ec2';
import { DefaultInstanceTenancy, RouterType } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

interface vpcConfig {
  name: string;
  cidr: string;
}

interface igwConfig {
  name: string;
}

interface publicSubnetConfig {
  name: string;
  availabilityZone: string;
  cidrBlock: string;
}

interface privateSubnetConfig {
  name: string;
  availabilityZone: string;
  cidrBlock: string;
}

interface subnetConfig {
  public: publicSubnetConfig[];
  private: privateSubnetConfig[];
}

interface StageContext {
  vpc: vpcConfig;
  igw: igwConfig;
  subnet: subnetConfig;
}

export class VpcStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const env: string = this.node.tryGetContext('env') || 'Demo';
    const revision: string = this.node.tryGetContext('revision') || '';
    const context: StageContext =
      env == 'Test'
        ? JSON.parse(this.node.tryGetContext(env))
        : this.node.tryGetContext(env);

    this.validateEnvironment(env, revision, context);

    const vpc: ec2.Vpc = this.createVpc(context.vpc);

    const igw: ec2.CfnInternetGateway = this.createInternetGateway(
      vpc,
      context.igw
    );

    this.createPublicSubnet(vpc, igw, context.subnet.public);
    this.createprivateSubnet(vpc, context.subnet.private);
  }

  private validateEnvironment(
    env: string,
    revision: string,
    context: StageContext
  ): void {
    if (!(context.vpc && context.vpc.name && context.vpc.cidr)) {
      throw new Error(
        `error: invalid vpc context ${JSON.stringify({
          env: env,
          revision: revision,
          context: context,
        })}`
      );
    }
    if (!context.igw.name) {
      throw new Error(
        `error: invalid igw context ${JSON.stringify({
          env: env,
          revision: revision,
          context: context,
        })}`
      );
    }

    if (!(context.subnet.public.length > 0)) {
      throw new Error(
        `error: invalid subnet context ${JSON.stringify({
          env: env,
          revision: revision,
          context: context,
        })}`
      );
    }
  }

  private createVpc(vpcConfig: vpcConfig): ec2.Vpc {
    return new ec2.Vpc(this, vpcConfig.name, {
      cidr: vpcConfig.cidr,
      defaultInstanceTenancy: DefaultInstanceTenancy.DEFAULT,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 0,
      subnetConfiguration: [],
    });
  }

  private createInternetGateway(
    vpc: ec2.Vpc,
    igwConfig: igwConfig
  ): ec2.CfnInternetGateway {
    const igw: ec2.CfnInternetGateway = new ec2.CfnInternetGateway(
      this,
      igwConfig.name,
      {}
    );
    new ec2.CfnVPCGatewayAttachment(this, igwConfig.name + '-attachemnt', {
      vpcId: vpc.vpcId,
      internetGatewayId: igw.ref,
    });
    return igw;
  }

  private createPublicSubnet(
    vpc: ec2.Vpc,
    igw: ec2.CfnInternetGateway,
    publicSubnetConfig: publicSubnetConfig[]
  ): void {
    publicSubnetConfig.forEach((pubSubCon: publicSubnetConfig) => {
      const publicSubnet: ec2.Subnet = new ec2.Subnet(this, pubSubCon.name, {
        availabilityZone: pubSubCon.availabilityZone,
        vpcId: vpc.vpcId,
        cidrBlock: pubSubCon.cidrBlock,
        mapPublicIpOnLaunch: true,
      });
      // HACK: 各subnetに対して専用のRouteTableが生成される
      publicSubnet.addRoute('route-demo-mini-app', {
        routerId: igw.ref,
        routerType: RouterType.GATEWAY,
      });
    });
  }

  private createprivateSubnet(
    vpc: ec2.Vpc,
    privateSubnetConfig: privateSubnetConfig[]
  ): void {
    privateSubnetConfig.forEach((prvSubCon: privateSubnetConfig) => {
      new ec2.Subnet(this, prvSubCon.name, {
        availabilityZone: prvSubCon.availabilityZone,
        vpcId: vpc.vpcId,
        cidrBlock: prvSubCon.cidrBlock,
      });
    });
  }
}
