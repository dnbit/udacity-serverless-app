import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, DeleteItemOutput } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

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

    async updateTodo(todoId: String, updateTodoRequest: UpdateTodoRequest, userId: string): Promise<String> {
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: "set #name = :n, dueDate = :due, done = :d",
        ExpressionAttributeValues: {
          ":n": updateTodoRequest.name,
          ":due": updateTodoRequest.dueDate,
          ":d": updateTodoRequest.done
        },
        ExpressionAttributeNames:{
          // Attribute name is a reserved keyword so it cannot be used
          // This is required to change name to something different, such as #name
          "#name": "name"
        }
      }).promise()

      return "Item updated"
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