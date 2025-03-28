const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
const tableName = process.env.TARGET_TABLE;

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  console.log('Table Name:', tableName);
  console.log('AWS SDK Version:', AWS.VERSION);
  
  try {
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else if (typeof event === 'object') {
      body = event;
    } else {
      throw new Error('Invalid event structure');
    }

    const { principalId, content } = body;

    if (!principalId || !content) {
      throw new Error('Missing required fields: principalId or content');
    }

    const item = {
      id: AWS.util.uuid.v4(),
      principalId: principalId,
      createdAt: new Date().toISOString(),
      body: content
    };

    console.log('Item to be inserted:', JSON.stringify(item));

    const params = {
      TableName: tableName,
      Item: item
    };

    console.log('DynamoDB Put params:', JSON.stringify(params));

    try {
      const result = await dynamodb.put(params).promise();
      console.log('DynamoDB Put result:', JSON.stringify(result));
    } catch (dbError) {
      console.error('DynamoDB Put error:', dbError);
      throw dbError;
    }

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