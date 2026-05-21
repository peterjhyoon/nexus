import { useState, useEffect } from 'react';
import type { Todo } from '../../services/todoService';
import { todoService } from '../../services/todoService';
import { FilterBar } from '../filterbar/FilterBar';
import './TodoList.css';

interface TodoListProps {
  refreshTrigger: number;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onTasksLoaded?: (tasks: Todo[]) => void;
}

export function TodoList({ refreshTrigger, selectedTaskId, onSelectTask, onTasksLoaded }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('date-asc');
  const [labelFilter, setLabelFilter] = useState('');

  const loadTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await todoService.getAllTodos();
      setTodos(data);
      onTasksLoaded?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [refreshTrigger]);

  const getFilteredAndSortedTodos = () => {
    let filtered = todos;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Date filter
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
        break;
      case 'week':
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate <= weekEnd;
        });
        break;
      case 'active':
        filtered = filtered.filter((t) => !t.completed);
        break;
      case 'completed':
        filtered = filtered.filter((t) => t.completed);
        break;
    }

    // Label filter
    if (labelFilter) {
      filtered = filtered.filter((t) => t.labels?.includes(labelFilter));
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'date-desc':
          if (!a.dueDate) return -1;
          if (!b.dueDate) return 1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'priority': {
          const priorityMap = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityMap[a.priority as keyof typeof priorityMap] || 0;
          const bPriority = priorityMap[b.priority as keyof typeof priorityMap] || 0;
          return bPriority - aPriority;
        }
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  };

  const allLabels = Array.from(new Set(todos.flatMap((t) => t.labels || [])));
  const filteredTodos = getFilteredAndSortedTodos();

  if (isLoading) {
    return <div className="todo-list-sidebar loading">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="todo-list-sidebar error">
        <p>Error: {error}</p>
        <button onClick={loadTodos} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="todo-list-sidebar">
      <FilterBar
        selectedFilter={dateFilter}
        selectedSort={sortOrder}
        selectedLabel={labelFilter}
        availableLabels={allLabels}
        onFilterChange={setDateFilter}
        onSortChange={setSortOrder}
        onLabelChange={setLabelFilter}
      />

      {filteredTodos.length === 0 ? (
        <div className="empty-state">
          <p>No tasks match your filters</p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`task-summary ${selectedTaskId === todo.id ? 'selected' : ''} ${todo.completed ? 'completed' : ''}`}
              onClick={() => onSelectTask(todo.id)}
              role="button"
              tabIndex={0}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => {}}
                className="task-checkbox-small"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="task-summary-content">
                <div className="task-summary-title">{todo.title}</div>
                {todo.dueDate && (
                  <div className="task-summary-meta">
                    {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
              {todo.priority && (
                <div className={`priority-indicator priority-${todo.priority}`} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
