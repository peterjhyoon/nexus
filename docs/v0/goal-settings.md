# Design Doc: Goal Settings
**Issue:** [#2 — Add goal settings with daily, weekly, monthly and yearly view settings](https://github.com/peterjhyoon/nexus/issues/2)

**Status:** Draft

**Related Issues:** [#3 — Budget expense tracking](https://github.com/peterjhyoon/nexus/issues/3)

---

## Overview

Goals are high-level objectives analogous to epics in Jira. Each goal has a time scope (daily, weekly, monthly, or yearly) and can contain subtasks at any scope level. This feature adds a Goals section to Nexus alongside the existing task list, sharing the same underlying task/subtask infrastructure while layering on goal-specific metadata, progress tracking, and filtered timeline views.

---

## Goals & Non-Goals

**In scope (V0):**
- Create, read, update, delete goals
- Assign a scope (daily / weekly / monthly / yearly) to each goal
- Add existing or new tasks as subtasks under a goal
- View goals in a filtered timeline broken down by scope
- Track goal completion progress based on subtask completion
- Goal templates
- Recurring goals

**Out of scope (V0):**
- Goal collaboration / sharing between users
- Budget linkage (see Issue #3)

---

## Data Model

### New table: `goals`

```sql
CREATE TABLE goals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT,
  scope       TEXT    NOT NULL CHECK(scope IN ('daily', 'weekly', 'monthly', 'yearly')),
  status      TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
  start_date  TEXT    NOT NULL,   -- ISO 8601 date string (e.g. "2026-05-20")
  end_date    TEXT,               -- optional; auto-derived from scope if omitted
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### New join table: `goal_tasks`

Links goals to tasks. Tasks remain first-class citizens in the existing `tasks` table so they continue to appear in the task list as well.

```sql
CREATE TABLE goal_tasks (
  goal_id   INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  task_id   INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, task_id)
);
```

### Existing `tasks` table — no schema changes required

Tasks already have (assumed) a `completed` boolean and `created_at`. The goal progress computation is done at query time by joining `goal_tasks` → `tasks`.

---

## API

All endpoints live under `/api/goals`.

### `GET /api/goals`

Returns all goals, optionally filtered by scope and/or date range.

**Query params:**
- `scope` — `daily | weekly | monthly | yearly`
- `from` — ISO date (inclusive)
- `to` — ISO date (inclusive)
- `status` — `active | completed | archived` (default: `active`)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Ship goals feature",
    "description": "...",
    "scope": "weekly",
    "status": "active",
    "start_date": "2026-05-18",
    "end_date": "2026-05-24",
    "progress": 0.4,          // completed tasks / total tasks
    "task_count": 5,
    "completed_task_count": 2,
    "created_at": "2026-05-18T09:00:00Z",
    "updated_at": "2026-05-18T09:00:00Z"
  }
]
```

### `POST /api/goals`

Create a new goal. If `end_date` is omitted the server derives it from `scope` and `start_date`.

**Request body:**
```json
{
  "title": "Ship goals feature",
  "description": "...",
  "scope": "weekly",
  "start_date": "2026-05-18",
  "end_date": "2026-05-24"    // optional
}
```

### `GET /api/goals/:id`

Returns a single goal with its full task list.

**Response:**
```json
{
  "id": 1,
  "title": "...",
  "scope": "weekly",
  "status": "active",
  "start_date": "2026-05-18",
  "end_date": "2026-05-24",
  "progress": 0.4,
  "tasks": [
    { "id": 10, "title": "Design DB schema", "completed": true },
    { "id": 11, "title": "Write API routes", "completed": false }
  ]
}
```

### `PATCH /api/goals/:id`

Partial update — any combination of `title`, `description`, `scope`, `status`, `start_date`, `end_date`.

### `DELETE /api/goals/:id`

Soft-delete by setting `status = 'archived'`. Hard-delete only if explicitly desired (cascade removes `goal_tasks` rows).

### `POST /api/goals/:id/tasks`

Add one or more tasks to a goal. Tasks must already exist in the `tasks` table.

**Request body:**
```json
{ "task_ids": [10, 11, 12] }
```

### `DELETE /api/goals/:id/tasks/:taskId`

Remove a task from a goal (does not delete the task itself).

---

## Server Code Changes

### New files

- `server/src/routes/goals.ts` — Express router for all `/api/goals` routes
- `server/src/db/goals.ts` (or inline in router) — SQL queries for goals and goal_tasks

### Changes to existing files

- `server/src/index.ts` — Mount `goalsRouter` at `/api/goals`
- `server/src/db.ts` — Add `CREATE TABLE` statements for `goals` and `goal_tasks` in the `initDb()` function

### Helper: `deriveEndDate(startDate: string, scope: GoalScope): string`

```ts
function deriveEndDate(startDate: string, scope: GoalScope): string {
  const d = new Date(startDate);
  switch (scope) {
    case 'daily':   d.setDate(d.getDate());      break; // same day
    case 'weekly':  d.setDate(d.getDate() + 6);  break;
    case 'monthly': d.setMonth(d.getMonth() + 1, d.getDate() - 1); break;
    case 'yearly':  d.setFullYear(d.getFullYear() + 1, d.getMonth(), d.getDate() - 1); break;
  }
  return d.toISOString().split('T')[0];
}
```

### Progress computation query

```sql
SELECT
  g.*,
  COUNT(gt.task_id)                                   AS task_count,
  SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END)   AS completed_task_count,
  ROUND(
    CAST(SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) AS REAL)
    / NULLIF(COUNT(gt.task_id), 0),
    2
  ) AS progress
FROM goals g
LEFT JOIN goal_tasks gt ON gt.goal_id = g.id
LEFT JOIN tasks t ON t.id = gt.task_id
WHERE g.id = ?
GROUP BY g.id;
```

---

## UI Changes

### New route: `/goals`

Add a **Goals** nav item in the sidebar (alongside the existing task list). This renders `GoalsPage`.

### `GoalsPage`

Top-level layout:

```
[ Daily ] [ Weekly ] [ Monthly ] [ Yearly ]      <- scope filter tabs
                                       [ + New Goal ]

[ Goal Card ]  [ Goal Card ]  [ Goal Card ] ...
```

Scope tabs filter the displayed goals by their `scope` field. The selected tab persists in the URL (`/goals?scope=weekly`) so it's shareable.

### `GoalCard`

Displays:
- Title and description (truncated)
- Scope badge
- Date range (e.g. "May 18 – May 24")
- Progress bar (completed / total tasks)
- Subtask count chip
- Click → opens `GoalDetailModal`

### `GoalDetailModal` (or `/goals/:id` page)

Full-detail view:
- Editable title, description, scope, date range
- Subtask list — each row shows task title + completion checkbox
- "Add existing task" search/select dropdown (fetches from existing `/api/tasks`)
- "Create new task" inline form (POSTs to `/api/tasks` then links via `POST /api/goals/:id/tasks`)
- Progress ring / bar at the top

### `NewGoalModal`

Simple form: title (required), description, scope picker (defaults to `weekly`), start date (defaults to today), optional end date.

### Linking with the existing task list

Tasks linked to a goal should display a goal chip / badge in the task list view (e.g. a small coloured tag "Goal: Ship goals feature"). This requires:
- `GET /api/tasks` response to optionally include a `goals: [{id, title}]` array — join `goal_tasks` when fetching tasks
- `TaskItem` component to conditionally render a `GoalBadge`

---

## Open Questions

1. **Can a task belong to multiple goals?** The current schema allows it. Should we restrict to one goal per task, or is many-to-many acceptable?
2. **Date validation:** Should the UI enforce that `end_date >= start_date`, or derive it automatically and hide the field?
3. **Goal nesting:** The issue description hints at subtasks "at various scopes." Does this mean goals can contain other goals (hierarchical epics), or is it simply tasks at different granularities? V0 assumption: tasks only, no nested goals.
4. **Notifications / reminders:** Out of scope for V0, but worth flagging — daily/weekly goals suggest a cadence that lends itself to reminder notifications.

---

## Implementation Checklist

These map back to GitHub issues and can be broken out as sub-issues or tasks:

- [ ] DB migration: add `goals` and `goal_tasks` tables (`server/src/db.ts`)
- [ ] Implement `GET/POST /api/goals` with scope + date filtering
- [ ] Implement `GET/PATCH/DELETE /api/goals/:id`
- [ ] Implement `POST /api/goals/:id/tasks` and `DELETE /api/goals/:id/tasks/:taskId`
- [ ] Extend `GET /api/tasks` to return goal membership metadata
- [ ] Add `GoalsPage` with scope filter tabs (links from Issue #2)
- [ ] Build `GoalCard` and `GoalDetailModal` components
- [ ] Build `NewGoalModal` with form validation
- [ ] Add goal badge/chip to `TaskItem` in the task list (links with the existing task list from Issue #1)
- [ ] Wire up `/goals` route in React Router and add sidebar nav link
- [ ] E2E: create goal → add tasks → mark tasks complete → verify progress updates