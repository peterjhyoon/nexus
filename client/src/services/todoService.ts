export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = 'http://localhost:3000/api';

export const todoService = {
  async getAllTodos(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE}/todos`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    const data = await response.json();
    return data.todos;
  },

  async getTodoById(id: string): Promise<Todo> {
    const response = await fetch(`${API_BASE}/todos/${id}`);
    if (!response.ok) throw new Error('Failed to fetch todo');
    const data = await response.json();
    return data.todo;
  },

  async createTodo(title: string, description?: string, dueDate?: string, priority?: string, labels?: string[]): Promise<Todo> {
    const response = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, dueDate, priority, labels }),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    const data = await response.json();
    return data.todo;
  },

  async updateTodo(
    id: string,
    updates: { title?: string; description?: string; completed?: boolean; dueDate?: string; priority?: string; labels?: string[] }
  ): Promise<Todo> {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    const data = await response.json();
    return data.todo;
  },

  async deleteTodo(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
    const data = await response.json();
    return data.success;
  },
};
