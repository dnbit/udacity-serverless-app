import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  
  const todoId = event.pathParameters.todoId

  const parsedBody: UpdateTodoRequest = JSON.parse(event.body)
  const name = parsedBody.name
  const dueDate = parsedBody.dueDate
  const done = parsedBody.done

  const userId = getUserId(event)

  await docClient.update({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: "set name = :n, dueDate = :due, done = :d",
    ExpressionAttributeValues: {
      ":n": name,
      ":due": dueDate,
      ":d": done
    },
  }).promise()

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      parsedBody
    })
  }
}
