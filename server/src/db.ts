import sqlite3 from 'sqlite3';
import path from 'path';
import { Todo, CreateTodoInput, UpdateTodoInput } from './types';

const DB_PATH = path.join(__dirname, '../data/todos.db');

let db: sqlite3.Database;

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create todos table if it doesn't exist
      db.run(
        `
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT 0,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
        `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✓ Database initialized');
            resolve();
          }
        }
      );
    });
  });
};

export const getDatabase = (): sqlite3.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
};

export const getAllTodos = (): Promise<Todo[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM todos ORDER BY createdAt DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve((rows || []) as Todo[]);
      }
    });
  });
};

export const getTodoById = (id: string): Promise<Todo | null> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve((row as Todo) || null);
      }
    });
  });
};

export const createTodo = (todo: CreateTodoInput): Promise<Todo> => {
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO todos (id, title, description, completed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [todo.id, todo.title, todo.description || null, todo.completed ? 1 : 0, createdAt, updatedAt],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            ...todo,
            createdAt,
            updatedAt,
          });
        }
      }
    );
  });
};

export const updateTodo = (id: string, updates: UpdateTodoInput): Promise<Todo | null> => {
  const updatedAt = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }

  fields.push('updatedAt = ?');
  values.push(updatedAt);
  values.push(id);

  if (fields.length === 1) {
    // Only updatedAt was set
    return getTodoById(id);
  }

  return new Promise((resolve, reject) => {
    db.run(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
      if (err) {
        reject(err);
      } else {
        getTodoById(id).then(resolve).catch(reject);
      }
    });
  });
};

export const deleteTodo = (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
};
