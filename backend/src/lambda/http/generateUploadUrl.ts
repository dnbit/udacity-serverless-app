import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { updateAttachmentUrl } from '../../businessLogic/todos'
import { getPresignedUrl } from '../../businessLogic/storage'
import { getUserId } from '../utils'

const image_bucket_name = process.env.IMAGES_S3_BUCKET;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const AttachmentUrl: string = `https://${image_bucket_name}.s3.amazonaws.com/${todoId}`;
  
  await updateAttachmentUrl(todoId, getUserId(event), AttachmentUrl)

  const uploadUrl = await getPresignedUrl(todoId)

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}
