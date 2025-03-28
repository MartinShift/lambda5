const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TARGET_TABLE;

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  console.log('Table Name:', tableName);
  
  try {
    const body = JSON.parse(event.body);
    const { principalId, content } = body;

    const item = {
      id: AWS.util.uuid.v4(),
      principalId: principalId,
      createdAt: new Date().toISOString(),
      body: content
    };

    console.log('Putting item:', JSON.stringify(item));

    await dynamodb.put({
      TableName: tableName,
      Item: item
    }).promise();

    console.log('Item put successfully');

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