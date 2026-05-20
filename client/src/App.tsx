import { useState } from 'react';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { TaskDetails } from './components/TaskDetails';
import type { Todo } from './services/todoService';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const handleTodoCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsCreateMode(false);
  };

  const handleSelectTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setSelectedTaskId(taskId);
    setSelectedTask(task || null);
    setIsCreateMode(false);
  };

  const handleTaskUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedTaskId(null);
    setSelectedTask(null);
    setIsCreateMode(false);
  };

  const handleTasksLoaded = (loadedTasks: Todo[]) => {
    setTasks(loadedTasks);
    if (selectedTaskId) {
      const task = loadedTasks.find((t) => t.id === selectedTaskId);
      setSelectedTask(task || null);
    }
  };

  const openCreateMode = () => {
    setIsCreateMode(true);
    setSelectedTaskId(null);
    setSelectedTask(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Nexus</h1>
        <p className="subtitle">Get things done, all in one place</p>
      </header>

      <main className="app-main">
        <div className="app-layout">
          <div className="main-content">
            <div className="tasks-sidebar">
              <div className="container">
                <div className="sidebar-header">
                  <h2 className="sidebar-title">Tasks</h2>
                  <button onClick={openCreateMode} className="btn btn-primary btn-small" title="Create new task">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <TodoList
                  refreshTrigger={refreshTrigger}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={handleSelectTask}
                  onTasksLoaded={handleTasksLoaded}
                />
              </div>
            </div>

            <div className="task-details-panel">
              <div className="container">
                {isCreateMode ? (
                  <TodoForm onTodoCreated={handleTodoCreated} />
                ) : (
                  <TaskDetails task={selectedTask} onTaskUpdated={handleTaskUpdated} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 Nexus. Get things done.</p>
      </footer>
    </div>
  );
}

export default App;
