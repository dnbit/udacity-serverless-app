import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import { getUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export async function getAllTodos(): Promise<TodoItem[]> {
    return todoAccess.getAllTodos()
}

export async function createTodo(createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const itemId = uuid.v4()

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: "TODO: mock userId",
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest
    })
}

export async function deleteTodo(todoId: String): Promise<String> {
    return todoAccess.deleteTodo(todoId)
}
