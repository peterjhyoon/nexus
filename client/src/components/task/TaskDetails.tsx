import type { Todo } from '../../services/todoService';
import { todoService } from '../../services/todoService';
import './TaskDetails.css';

interface TaskDetailsProps {
  task: Todo | null;
  onTaskUpdated: () => void;
}

export function TaskDetails({ task, onTaskUpdated }: TaskDetailsProps) {
  if (!task) {
    return <div className="task-details-empty">Select a task to view details</div>;
  }

  const priorityColors: Record<string, string> = {
    high: '#dc2626',
    medium: '#ea580c',
    low: '#16a34a',
  };

  const handleToggleComplete = async () => {
    try {
      await todoService.updateTodo(task.id, { completed: !task.completed });
      onTaskUpdated();
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      try {
        await todoService.deleteTodo(task.id);
        onTaskUpdated();
      } catch (err) {
        console.error('Failed to delete todo:', err);
      }
    }
  };

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && dueDateObj < new Date() && !task.completed;
  const isToday = dueDateObj && dueDateObj.toDateString() === new Date().toDateString();

  return (
    <div className="task-details">
      <div className="task-details-header">
        <div className="task-details-title-section">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            className="task-checkbox"
            aria-label="Mark task complete"
          />
          <h2 className={`task-details-title ${task.completed ? 'completed' : ''}`}>
            {task.title}
          </h2>
        </div>
        <button onClick={handleDelete} className="btn btn-delete" title="Delete task">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {task.priority && (
        <div className="task-detail-field">
          <span className="field-label">Priority</span>
          <span
            className="priority-badge"
            style={{ backgroundColor: priorityColors[task.priority] || '#6b7280' }}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      )}

      {task.dueDate && (
        <div className="task-detail-field">
          <span className="field-label">Due Date</span>
          <span className={`due-date ${isOverdue ? 'overdue' : ''} ${isToday ? 'today' : ''}`}>
            {dueDateObj?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {isToday && ' (Today)'}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="task-detail-field">
          <span className="field-label">Labels</span>
          <div className="labels-container">
            {task.labels.map((label) => (
              <span key={label} className="label-tag">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {task.description && (
        <div className="task-detail-field full-width">
          <span className="field-label">Description</span>
          <p className="task-description">{task.description}</p>
        </div>
      )}

      <div className="task-meta">
        <span className="meta-text">
          Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
