import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, DeleteItemOutput } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly indexName = process.env.INDEX_NAME) {
    }
  
    async getAllTodos(userId: string): Promise<TodoItem[]> {
      console.log('Getting all todos')
  
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: {
          ":u": userId
        }
      }).promise()
  
      const items = result.Items
      return items as TodoItem[]
    }
  
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise()
  
      return todoItem
    }

    async deleteTodo(todoId: String, userId: string): Promise<String> {
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
      }).promise()

      return "Item deleted"
    }
  }

  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }