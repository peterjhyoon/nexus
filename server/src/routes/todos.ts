import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo } from '../db';
import { CreateTodoInput, UpdateTodoInput } from '../types';

const router = Router();

/**
 * GET /api/todos
 * Get all todos
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const todos = await getAllTodos();
    res.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

/**
 * GET /api/todos/:id
 * Get a single todo by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const todo = await getTodoById(id);

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({ todo });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

/**
 * POST /api/todos
 * Create a new todo
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ error: 'Title is required and must be a non-empty string' });
      return;
    }

    const todoInput: CreateTodoInput = {
      id: uuidv4(),
      title: title.trim(),
      description: description?.trim() || undefined,
      completed: false,
    };

    const todo = await createTodo(todoInput);
    res.status(201).json({ todo });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

/**
 * PATCH /api/todos/:id
 * Update a todo (title, description, completed status)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, description, completed } = req.body;

    // Check if todo exists
    const existingTodo = await getTodoById(id);
    if (!existingTodo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    // Validation
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      res.status(400).json({ error: 'Title must be a non-empty string' });
      return;
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      res.status(400).json({ error: 'Completed must be a boolean' });
      return;
    }

    const updates: UpdateTodoInput = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || undefined;
    if (completed !== undefined) updates.completed = completed;

    const updatedTodo = await updateTodo(id, updates);
    res.json({ todo: updatedTodo });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

/**
 * DELETE /api/todos/:id
 * Delete a todo
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Check if todo exists
    const existingTodo = await getTodoById(id);
    if (!existingTodo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const deleted = await deleteTodo(id);
    res.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
