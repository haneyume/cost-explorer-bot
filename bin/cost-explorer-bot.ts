#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CostExplorerBotStack } from '../lib/cost-explorer-bot-stack';

const app = new cdk.App();
const costExplorerBotStack = new CostExplorerBotStack(
  app,
  'CostExplorerBotStack',
  {},
);

cdk.Tags.of(costExplorerBotStack).add('Project', 'Cost Explorer Bot');
cdk.Tags.of(costExplorerBotStack).add('Usage', 'Cost Explorer Bot');
