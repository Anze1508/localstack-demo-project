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

1. Create a DynamoDB table using the AWS CLI, targeting LocalStack:
```
aws --endpoint-url=http://localhost:4566 --region us-east-1 dynamodb create-table --table-name Users --attribute-definitions AttributeName=userId,AttributeType=S --key-schema AttributeName=userId,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
```

_Set up AWS credentials with: ´aws configure´ if needed._

2. Verify the table creation:
```
aws --endpoint-url=http://localhost:4566 dynamodb list-tables
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


