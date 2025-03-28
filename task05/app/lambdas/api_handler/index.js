const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { principalId, content } = body;

    const item = {
      id: uuidv4(),
      principalId: principalId,
      createdAt: new Date().toISOString(),
      body: content
    };

    await dynamodb.put({
      TableName: process.env.TARGET_TABLE,
      Item: item
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        statusCode: 201,
        event: item
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        error: error.message
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};