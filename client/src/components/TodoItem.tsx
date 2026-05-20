import type { Todo } from '../services/todoService';
import { todoService } from '../services/todoService';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onUpdate: () => void;
  onDelete: () => void;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const handleToggleComplete = async () => {
    try {
      await todoService.updateTodo(todo.id, { completed: !todo.completed });
      onUpdate();
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    try {
      await todoService.deleteTodo(todo.id);
      onDelete();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="checkbox"
          aria-label="Mark todo as done"
        />
      </div>
      <div className="todo-content">
        <div className="todo-header">
          <h3 className="todo-title">{todo.title}</h3>
          <span className="todo-date">
            {new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        {todo.description && <p className="todo-description">{todo.description}</p>}
      </div>
      <button 
        onClick={handleDelete} 
        className="btn btn-delete" 
        title="Delete todo"
        aria-label="Delete todo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
