import json
import uuid
from datetime import datetime
import boto3
from commons.log_helper import get_logger
from commons.abstract_lambda import AbstractLambda

_LOG = get_logger(__name__)

class ApiHandler(AbstractLambda):

    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table('Events')

    def validate_request(self, event) -> dict:
        body = json.loads(event.get('body', '{}'))
        if 'principalId' not in body or 'content' not in body:
            raise ValueError("Missing required fields: principalId or content")
        return event

    def handle_request(self, event, context):
        """
        Handle POST request to create a new event in DynamoDB
        """
        try:
            body = json.loads(event['body'])
            principal_id = body['principalId']
            content = body['content']

            event_item = {
                'id': str(uuid.uuid4()),
                'principalId': principal_id,
                'createdAt': datetime.utcnow().isoformat() + 'Z',
                'body': content
            }

            self.table.put_item(Item=event_item)

            _LOG.info(f"Event created: {event_item['id']}")

            return {
                'statusCode': 201,
                'body': json.dumps({
                    'statusCode': 201,
                    'event': event_item
                }),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
        except Exception as e:
            _LOG.error(f"Error creating event: {str(e)}")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': str(e)}),
                'headers': {'Content-Type': 'application/json'}
            }

HANDLER = ApiHandler()

def lambda_handler(event, context):
    return HANDLER.lambda_handler(event=event, context=context)