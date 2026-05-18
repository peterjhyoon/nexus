# V0 To Do List - Setup & Implementation Guide

## Overview
This document outlines the setup and implementation progress for the V0 To Do List feature.

---

## Project Structure

### Server (`/server`)
```
server/
├── src/
│   ├── db.ts              # Database initialization & CRUD operations
│   ├── routes/
│   │   └── todos.ts       # Todo API routes (TODO)
│   └── index.ts           # Express app entry point (TODO)
├── data/
│   └── todos.db           # SQLite database file (auto-created)
├── package.json
├── tsconfig.json
└── README.md
```

### Client (`/client`)
```
client/
├── src/
│   ├── components/
│   │   ├── TodoList.tsx       # Todo list display (TODO)
│   │   ├── TodoItem.tsx       # Individual todo item (TODO)
│   │   └── TodoForm.tsx       # Add new todo form (TODO)
│   ├── services/
│   │   └── todoService.ts     # API client service (TODO)
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

---

## Setup Progress

### ✅ Phase 1: Backend Setup (In Progress)

#### 1.1 Dependencies Installed
```bash
cd server
npm install sqlite3
```

**Dependencies added to server:**
- `sqlite3` - Database driver for persistent storage
- `express` - Web framework (already installed)
- `cors` - CORS middleware (already installed)
- `dotenv` - Environment variables (already installed)

#### 1.2 TypeScript Configuration
**File:** `server/tsconfig.json`
- Configured for CommonJS module system
- Target ES2020
- Strict type checking enabled
- Source maps for debugging

#### 1.3 Database Layer
**File:** `server/src/db.ts`

Created database module with:
- **Database Path:** `server/data/todos.db`
- **Table:** `todos` with columns:
  - `id` (TEXT, PRIMARY KEY) - Unique identifier
  - `title` (TEXT, NOT NULL) - Todo title
  - `description` (TEXT) - Optional description
  - `completed` (BOOLEAN) - Completion status
  - `createdAt` (TEXT) - Creation timestamp
  - `updatedAt` (TEXT) - Last update timestamp

**Exported Functions:**
- `initializeDatabase()` - Initialize DB and create tables
- `getDatabase()` - Get database instance
- `getAllTodos()` - Fetch all todos
- `getTodoById(id)` - Fetch single todo
- `createTodo(todo)` - Create new todo
- `updateTodo(id, updates)` - Update existing todo
- `deleteTodo(id)` - Delete todo

**Todo Interface:**
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 🔄 Phase 2: Backend API Routes (TODO)

**File:** `server/src/routes/todos.ts` (to be created)

Need to implement Express routes:
- `GET /api/todos` - List all todos
- `GET /api/todos/:id` - Get single todo
- `POST /api/todos` - Create todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

**Request/Response Examples:**
```
POST /api/todos
{
  "title": "Buy groceries",
  "description": "milk, eggs, bread"
}
→ Response: { todo: Todo }

PATCH /api/todos/:id
{
  "completed": true
}
→ Response: { todo: Todo }

DELETE /api/todos/:id
→ Response: { success: boolean }
```

### 🔄 Phase 3: Main Server File (TODO)

**File:** `server/src/index.ts` (to be created)

Need to:
- Initialize Express app
- Set up middleware (CORS, JSON parsing)
- Register todo routes
- Initialize database
- Start server on port 3000

### 🔄 Phase 4: Frontend Components (TODO)

**Components to create:**
1. `TodoList.tsx` - Main list component
2. `TodoItem.tsx` - Individual todo item with actions
3. `TodoForm.tsx` - Form to add new todos

**Features needed:**
- Display todos from API
- Add new todo
- Toggle completion status
- Delete todo
- Loading states
- Error handling

### 🔄 Phase 5: Frontend API Service (TODO)

**File:** `client/src/services/todoService.ts` (to be created)

Create API client to:
- Fetch all todos: `GET /api/todos`
- Create todo: `POST /api/todos`
- Update todo: `PATCH /api/todos/:id`
- Delete todo: `DELETE /api/todos/:id`

### 🔄 Phase 6: Styling (TODO)

**Theme:** Light blue/white minimalistic
- White background
- Light blue (#E8F4F8) accents
- Darker blue (#4A90E2) for CTAs
- Gray tones for text/borders
- Green for completion checkmarks

---

## Environment Variables

**Server `.env` file** (optional for V0):
```
PORT=3000
NODE_ENV=development
```

---

## Running the Application

### Terminal 1 - Server
```bash
cd server
npm install
npm run dev
```
Server: `http://localhost:3000`

### Terminal 2 - Client
```bash
cd client
npm install
npm run dev
```
Client: `http://localhost:5173`

---

## Next Steps

1. ✅ Database layer setup
2. ⏳ Create Express routes for todo CRUD operations
3. ⏳ Create main server file (index.ts)
4. ⏳ Create React components
5. ⏳ Create API service client
6. ⏳ Apply styling (light blue/white theme)
7. ⏳ End-to-end testing

---

## Database Queries Reference

**Create todos table:**
```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
```

**Browse database (CLI):**
```bash
sqlite3 server/data/todos.db
.tables
SELECT * FROM todos;
```
