export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateTodoInput = Omit<Todo, 'createdAt' | 'updatedAt'>;
export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'createdAt'>>;
