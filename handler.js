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
