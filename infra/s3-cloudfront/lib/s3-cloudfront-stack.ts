import * as cdk from "@aws-cdk/core";
import * as cloudFront from "@aws-cdk/aws-cloudfront";
import * as s3 from "@aws-cdk/aws-s3";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53Targets from "@aws-cdk/aws-route53-targets";

interface s3Config {
  bucketName: string;
  name: string;
}

interface cloudFrontConfig {
  distributionId: string;
  oaiId: string;
  acmArn: string;
  domainName: string;
}

interface hostedZoneConfig {
  id: string;
  domainName: string;
}

interface route53Config {
  id: string;
  hostedZone: hostedZoneConfig;
}

interface StageContext {
  description: string;
  domainName: string;
  s3: s3Config;
  cloudFront: cloudFrontConfig;
  route53: route53Config;
}

export class S3CloudfrontStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const env: string = this.node.tryGetContext("env") || "Demo";
    const revision: string = this.node.tryGetContext("revision") || "";

    const context: StageContext =
      env == "Test"
        ? JSON.parse(this.node.tryGetContext(env))
        : this.node.tryGetContext(env);

    this.validateEnvironment(env, revision, context);

    const oai: cloudFront.OriginAccessIdentity = new cloudFront.OriginAccessIdentity(
      this,
      context.cloudFront.oaiId,
      {
        comment: `TodonPartyBucket-${this.stackName}`,
      }
    );

    const bucket: s3.Bucket = this.createS3Bucket(context);

    const distribution: cloudFront.CloudFrontWebDistribution = this.createCloudFront(
      bucket,
      oai,
      context.cloudFront
    );

    this.createARecordWithCloudFront(context, distribution);
  }

  private validateEnvironment(
    env: string,
    revision: string,
    context: StageContext
  ): void {
    if (!(context.s3 && context.s3.bucketName && context.s3.name)) {
      throw new Error(
        `error: invalid s3 context ${JSON.stringify({
          env: env,
          revision: revision,
          context: context,
        })}`
      );
    }
    if (
      !(
        context.cloudFront &&
        context.cloudFront.distributionId &&
        context.cloudFront.oaiId &&
        context.cloudFront.acmArn &&
        context.cloudFront.domainName
      )
    ) {
      throw new Error(
        `error: invalid cloudFront context ${JSON.stringify({
          env: env,
          revision: revision,
          context: context,
        })}`
      );
    }
    if (
      !(
        context.route53 &&
        context.route53.id &&
        context.route53.hostedZone &&
        context.route53.hostedZone.domainName &&
        context.route53.hostedZone.id
      )
    ) {
      throw new Error(
        `error: invalid route53 context ${JSON.stringify({
          env: env,
          revision: revision,
          context: context,
        })}`
      );
    }
  }

  private createS3Bucket(context: StageContext): s3.Bucket {
    const bucket: s3.Bucket = new s3.Bucket(this, context.s3.name, {
      versioned: false,
      bucketName: context.s3.bucketName,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    return bucket;
  }

  private createCloudFront(
    bucket: s3.Bucket,
    oai: cloudFront.OriginAccessIdentity,
    config: cloudFrontConfig
  ): cloudFront.CloudFrontWebDistribution {
    const viewerCertificateConfig: cloudFront.ViewerCertificate = {
      aliases: [config.domainName],
      props: {
        acmCertificateArn: config.acmArn,
        minimumProtocolVersion: cloudFront.SecurityPolicyProtocol.TLS_V1_2_2019,
        sslSupportMethod: cloudFront.SSLMethod.SNI,
      },
    };

    const distProps: cloudFront.CloudFrontWebDistributionProps = {
      viewerCertificate: viewerCertificateConfig,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              compress: false,
            },
          ],
        },
      ],
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,

      errorConfigurations: [
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
      ],
      priceClass: cloudFront.PriceClass.PRICE_CLASS_ALL,
    };

    const distribution: cloudFront.CloudFrontWebDistribution = new cloudFront.CloudFrontWebDistribution(
      this,
      config.distributionId,
      distProps
    );

    return distribution;
  }

  private createARecordWithCloudFront(
    context: StageContext,
    distribution: cloudFront.CloudFrontWebDistribution
  ) {
    const hostedZone: route53.IHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "zone",
      {
        zoneName: context.route53.hostedZone.domainName,
        hostedZoneId: context.route53.hostedZone.id,
      }
    );
    return new route53.ARecord(this, context.route53.id, {
      recordName: context.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      // zone: hostedZone,
      zone: route53.HostedZone.fromLookup(this, context.route53.hostedZone.id, {
        domainName: context.route53.hostedZone.domainName,
      }),
    });
  }
}
