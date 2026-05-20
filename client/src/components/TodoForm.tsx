import { useState } from 'react';
import { todoService } from '../services/todoService';
import './TodoForm.css';

interface TodoFormProps {
  onTodoCreated: () => void;
}

export function TodoForm({ onTodoCreated }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [labels, setLabels] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const labelArray = labels
        .split(',')
        .map((l) => l.trim())
        .filter((l) => l);
      await todoService.createTodo(title, description || undefined, dueDate || undefined, priority, labelArray.length > 0 ? labelArray : undefined);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setLabels('');
      onTodoCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="title" className="form-label">Task Title</label>
        <input
          id="title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          disabled={isLoading}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description" className="form-label">Description (optional)</label>
        <textarea
          id="description"
          placeholder="Add details or notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
          disabled={isLoading}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="priority" className="form-label">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="labels" className="form-label">Labels (comma separated)</label>
        <input
          id="labels"
          type="text"
          placeholder="e.g. work, personal, urgent"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          className="form-input"
          disabled={isLoading}
        />
      </div>
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? 'Adding...' : 'Add Todo'}
        </button>
      </div>
    </form>
  );
}
