/**
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

// Imports
import { CfnJob } from '@aws-cdk/aws-glue';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Duration, Stack } from '@aws-cdk/core';
import { KinesisStreamGlueJob } from '../lib';

// Setup
const app = new App();
const stack = new Stack(app, 'test-kinesisstream-gluejob');
stack.templateOptions.description = 'Integration Test for aws-kinesisstream-gluejob';

const job = new CfnJob(stack, 'ExistingJob', {
  command: {
    name: 'glueetl',
    pythonVersion: '3',
    scriptLocation: new Bucket(stack, 'existingScriptLocation', {
      versioned: false,
      lifecycleRules: [{
        expiration: Duration.days(30)
      }]
    }).bucketArn,
  },
  role: new Role(stack, 'JobRole', {
    assumedBy: new ServicePrincipal('glue.amazonaws.com')
  }).roleArn
});

// Definitions
new KinesisStreamGlueJob(stack, 'test-kinesisstreams-lambda', {
  existingGlueJob: job,
  fieldSchema: [{
    name: "id",
    type: "int",
    comment: "Identifier for the record"
  }, {
    name: "name",
    type: "string",
    comment: "The name of the record"
  }, {
    name: "type",
    type: "string",
    comment: "The type of the record"
  }, {
    name: "numericvalue",
    type: "int",
    comment: "Some value associated with the record"
  }]
});

// Synth
app.synth();