# Database Schema

## Core Entities

### 1. Workspaces (`workspaces`)

Container for all projects and resources.

- `id`: uuid (PK)
- `name`: text
- `slug`: text (unique)
- `created_by`: uuid (FK -> auth.users/profiles)
- `created_at`: timestamptz

### 2. Profiles (`profiles`)

Public profile for authenticated users.

- `id`: uuid (PK, FK -> auth.users)
- `email`: text
- `full_name`: text
- `avatar_url`: text
- `role`: user_role enum ('admin', 'member', 'client')

### 3. Workspace Members (`workspace_members`)

Many-to-many relationship between users and workspaces.

- `workspace_id`: uuid (FK)
- `user_id`: uuid (FK)
- `role`: text ('admin', 'member')

### 4. Projects (`projects`)

- `id`: uuid (PK)
- `workspace_id`: uuid (FK)
- `name`: text
- `identifier`: text (e.g., "WEB", "MKT") - Used for issue IDs
- `created_at`: timestamptz

### 5. Issues (`issues`)

The core task unit.

- `id`: uuid (PK)
- `sequence_id`: integer (Auto-calculated: MAX(sequence_id) + 1 per project)
- `project_id`: uuid (FK)
- `workspace_id`: uuid (FK)
- `title`: text
- `description`: jsonb (Content)
- `priority`: priority enum ('urgent', 'high', 'medium', 'low', 'none')
- `status`: text (default: 'backlog')
- `assignee_id`: uuid (FK -> profiles)
- `created_at`: timestamptz

## Security

- **RLS (Row Level Security)** is enabled on all tables.
- Access is generally restricted to users who are members of the parent
  `workspace`.

### 6. Cycles (`cycles`)

Sprint management for projects.

- `id`: uuid (PK)
- `project_id`: uuid (FK)
- `name`: text
- `start_date`: date
- `end_date`: date
- `created_at`: timestamptz

### 7. Modules (`modules`)

Large-scale features or epics.

- `id`: uuid (PK)
- `project_id`: uuid (FK)
- `name`: text
- `description`: text (nullable)
- `status`: text (default: 'backlog')
- `start_date`: date (nullable)
- `target_date`: date (nullable)
- `created_at`: timestamptz
