const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' }); // Explicitly set the region
const tableName = process.env.TARGET_TABLE;

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  console.log('Table Name:', tableName);
  console.log('AWS SDK Version:', AWS.VERSION);
  
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

    const params = {
      TableName: tableName,
      Item: item
    };

    console.log('DynamoDB Put params:', JSON.stringify(params));

    const result = await dynamodb.put(params).promise();
    console.log('DynamoDB Put result:', JSON.stringify(result));

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
    console.error('Detailed error:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        error: error.message,
        errorType: error.name,
        errorStack: error.stack
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};