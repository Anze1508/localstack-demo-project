# Creating a simple application that stores user data (e.g., name and email) in DynamoDB and retrieves it using a Lambda function exposed through an API Gateway endpoint.

## Prerequisites

Before proceeding, please ensure you have the following installed and configured:

- **LocalStack**
- **AWS CLI**: Ensure the AWS CLI is installed and configured on your machine. It is crucial for interacting with the LocalStack AWS services.
- **Node.js**: Required for writing the AWS Lambda function.
- **Serverless Framework**: Simplifies the process of deploying your Lambda function and setting up the API Gateway.

## Step 1: Setting up the project

### Initialize a new Node.js project:
```
npm init -y
```

### Install AWS SDK for Node.js:
```
npm install aws-sdk
```

## Writing the Lambda function

### Create a file named handler.js and write a Lambda function to insert and retrieve user data from DynamoDB:

```
const AWS = require('aws-sdk');

// Configure AWS SDK to use LocalStack
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566'
});

exports.handler = async (event) => {
    const { httpMethod, pathParameters } = event;
    // Assume the table name is Users
    const TableName = 'Users';

    if (httpMethod === 'GET') {
        const { userId } = pathParameters;
        const params = {
            TableName,
            Key: { userId }
        };

        try {
            const { Item } = await dynamoDB.get(params).promise();
            return { statusCode: 200, body: JSON.stringify(Item) };
        } catch (error) {
            return { statusCode: 500, body: JSON.stringify(error) };
        }
    } else if (httpMethod === 'POST') {
        const { userId, name, email } = JSON.parse(event.body);
        const params = {
            TableName,
            Item: { userId, name, email }
        };

        try {
            await dynamoDB.put(params).promise();
            return { statusCode: 200, body: 'User created successfully' };
        } catch (error) {
            return { statusCode: 500, body: JSON.stringify(error) };
        }
    }
};
```

_This code snippet provides basic functionality for a GET and POST request to interact with DynamoDB._

## Step 3: Setting up DynamoDB with LocalStack

1. Create a DynamoDB table:
```
awslocal dynamodb create-table --table-name Users --attribute-definitions AttributeName=userId,AttributeType=S --key-schema AttributeName=userId,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
```

_Set up AWS credentials with: ´aws configure´ if needed._

2. Verify the table creation:
```
awslocal dynamodb list-tables
```

## Step 4: Deploying Lambda function and setting up API Gateway

1. Install the Serverless Framework
```
npm install -g serverless
```

2. Create a serverless.yml file in your project directory with the following content to define your service, function, and the API Gateway endpoint:
```
service: localstack-demo

provider:
  name: aws
  runtime: nodejs14.x
  stage: dev
  region: us-east-1
  endpointType: regional
  environment:
    DYNAMODB_ENDPOINT: http://localhost:4566

functions:
  hello:
    handler: handler.handler
    events:
      - http:
          path: users/{userId}
          method: get
```
## Step 5: Deploying with Serverless Framework

1. Complete your serverless.yml file with the setup for deploying your Lambda function and API Gateway. Below is an extended version of what we started, including configurations for both HTTP GET (retrieve user data) and POST (create user data):
```
service: localstack-demo

frameworkVersion: '2'

provider:
  name: aws
  runtime: nodejs14.x
  stage: dev
  region: us-east-1
  endpointType: regional
  environment:
    DYNAMODB_ENDPOINT: http://localhost:4566

plugins:
  - serverless-localstack

custom:
  localstack:
    stages:
      - dev
    host: http://localhost
    edgePort: 4566
    autostart: true

functions:
  getUser:
    handler: handler.handler
    events:
      - http:
          path: user/{userId}
          method: get
          cors: true
  createUser:
    handler: handler.handler
    events:
      - http:
          path: user
          method: post
          cors: true
```

2. Ensure LocalStack is configured for Serverless. The serverless-localstack plugin allows the Serverless Framework to deploy resources directly to LocalStack. Install the plugin by running:
```
npm install --save-dev serverless-localstack
```

3. Deploy your service to LocalStack. With LocalStack running, deploy your Serverless application:
```
serverless deploy --stage dev
```

This command deploys your Lambda functions and sets up the API Gateway endpoints in your LocalStack environment.

## Step 6: Testing the application

1. Test the GET and POST requests. Use a tool like curl or Postman to make requests to your API Gateway endpoints. The URLs will be displayed in the output of the serverless deploy command. Replace <api-id> with your actual API ID in the URLs below:
- POST to create a user:

```
curl -X POST http://localhost:4566/restapis/<api-id>/dev/_user_request_/user -d '{"userId":"1", "name":"John Doe", "email":"john@example.com"}'
```
- GET to retrieve a user:
```
curl http://localhost:4566/restapis/<api-id>/dev/_user_request_/user/1
```




