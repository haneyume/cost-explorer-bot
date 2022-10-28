import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import * as path from 'path';

export class CostExplorerBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /////////////////////////////////////////////////////////
    // Create Lambda Function
    /////////////////////////////////////////////////////////

    const costExplorerBotFunction = new NodejsFunction(this, 'my-function', {
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: path.join(__dirname, './lambda/CostExplorerBotFunction/index.ts'),
      handler: 'handler',
      environment: {
        TG_BOT_TOKEN: process.env.TG_BOT_TOKEN || '',
        TG_BOT_CHAT_ID: process.env.TG_BOT_CHAT_ID || '',
      },
    });

    costExplorerBotFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ce:GetCostAndUsage'],
        resources: ['*'],
      }),
    );

    /////////////////////////////////////////////////////////
    // Create EventBridge Rule
    /////////////////////////////////////////////////////////

    new events.Rule(this, 'my-rule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(6)),
      targets: [new targets.LambdaFunction(costExplorerBotFunction)],
    });
  }
}
