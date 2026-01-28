# Time Tracker (US-001)

## Overview

A pervasive time tracking utility embedded in the KyrieOS dashboard, allowing
team members to log hours against specific projects and issues.

## Key Features

- **Global Timer:** Accessible from the top navigation bar.
- **Context Aware:** Can link time to specific Issues or Projects.
- **Quick Logging:** Support for manual entry or stopwatch mode.
- **Data:** Logs are stored in `worklogs` table.

## Technical Details

- **Frontend:** `TimeTracker.tsx` (HeroUI v3).
- **Backend:** `saveWorklog` Server Action in `actions.ts`.
- **Validation:** Prevents zero-hour logs; verifies user session.
