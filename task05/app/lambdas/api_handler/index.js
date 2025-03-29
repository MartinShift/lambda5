const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'eu-west-1' });
const tableName = process.env.TARGET_TABLE;

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  console.log('Table Name:', tableName);
  console.log('AWS SDK Version:', AWS.VERSION);
  
  try {
    let body;
    if (event.body) {
      body = JSON.parse(event.body);
    } else if (event.principalId && event.content) {
      body = event;  // For direct invocation testing
    } else {
      throw new Error('Invalid event structure: missing body or principalId/content');
    }

    const { principalId, content } = body;

    if (!principalId || !content) {
      throw new Error('Missing required fields: principalId or content');
    }

    const item = {
      id: { S: AWS.util.uuid.v4() },
      principalId: { N: principalId.toString() },
      createdAt: { S: new Date().toISOString() },
      body: { S: JSON.stringify(content) }
    };

    console.log('Item to be inserted:', JSON.stringify(item));

    const params = {
      TableName: tableName,
      Item: item
    };

    console.log('DynamoDB Put params:', JSON.stringify(params));

    try {
      const putResult = await dynamodb.putItem(params).promise();
      console.log('DynamoDB Put result:', JSON.stringify(putResult));

      // Immediately try to get the item we just put
      const getParams = {
        TableName: tableName,
        Key: { id: item.id }
      };
      
      console.log('DynamoDB Get params:', JSON.stringify(getParams));
      
      const getResult = await dynamodb.getItem(getParams).promise();
      console.log('DynamoDB Get result:', JSON.stringify(getResult));

      return {
        statusCode: 201,
        body: JSON.stringify({
          statusCode: 201,
          event: {
            id: item.id.S,
            principalId: parseInt(item.principalId.N),
            createdAt: item.createdAt.S,
            body: JSON.parse(item.body.S)
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    } catch (dbError) {
      console.error('DynamoDB error:', JSON.stringify(dbError));
      throw dbError;
    }
  } catch (error) {
    console.error('Detailed error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        error: error.message,
        errorType: error.name,
        errorStack: error.stack
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};