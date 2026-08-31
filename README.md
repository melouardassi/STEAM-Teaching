# STEAM Hub

A private, single-user teaching dashboard for a Design & Technology teacher running
3D printing, architecture, robotics, branding, and product design courses (grades
8–10) within an IB framework.

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4, custom design tokens, Inter + IBM Plex Sans
- **Database:** SQLite via Prisma ORM (local file DB — `prisma/dev.db`)
- **Auth:** NextAuth.js (Auth.js v5) with a credentials provider, single hardcoded admin user
- **Drag & drop:** dnd-kit (Task Manager kanban board)
- **Charts:** Recharts (grade distribution)
- **Toasts:** Sonner

## Getting started

```bash
npm install        # installs deps and runs `prisma generate`
npm run db:migrate  # applies the Prisma schema to a fresh dev.db (first run only)
npm run db:seed     # populates sample courses, students, grades, tasks, etc.
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> The first `npm install` already ran `prisma generate` via its `postinstall` hook.
> If you ever change `prisma/schema.prisma`, run `npm run db:migrate` again to create
> a new migration and regenerate the client.

### Login

There is no registration page — this app is for one teacher.

| Email | Password |
| --- | --- |
| `admin@steamhub.app` | `changeme123` |

Change the password from **Settings → Change password** once you're in.

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build & start |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Run/create a Prisma migration |
| `npm run db:seed` | Re-seed sample data (safe to re-run — it clears and re-inserts) |
| `npm run db:reset` | Drop the dev database, re-migrate, and re-seed |
| `npm run db:studio` | Open Prisma Studio to browse the SQLite DB |

## Features

- **Dashboard** — greeting + rotating quote, today's class schedule, upcoming tasks,
  quick stats, and a recent activity feed.
- **Schedule & Calendar** — weekly (recurring) and monthly views; add/edit/delete
  class sessions; holidays, exams, and exhibition dates.
- **Courses** — course cards with unit/lesson outlines, lesson status tracking,
  enrolled students, and linked assignments.
- **Students** — searchable/filterable roster; profile pages with grades,
  attendance summary + quick logging, and a private notes field.
- **Assignments & Grades** — create assignments, enter grades in a spreadsheet-like
  table, paste-to-import scores in bulk, and a grade distribution chart.
- **Task Manager** — a drag-and-drop kanban board (To Do / In Progress / Done) with
  priority, due dates, course links, and filters. A floating **+** button on every
  page quick-adds a task.
- **Project Ideas Bank** — a browsable library of STEAM project ideas, taggable by
  subject, markable as "used," and one click away from becoming an assignment.
- **Settings** — profile, semester dates & breaks, password change, and CSV-paste
  bulk import for students and courses.
- **Dark mode** — toggle in the sidebar; the electric-blue accent stays constant.

## Project structure

```
app/
  (app)/            # authenticated routes, wrapped in the sidebar shell
    page.tsx         # dashboard
    schedule/ courses/ students/ assignments/ tasks/ projects/ settings/
  login/             # sign-in page (outside the shell)
  api/auth/[...nextauth]/
components/          # UI, organized by feature folder
lib/
  actions/           # server actions (mutations), one file per domain
  prisma.ts constants.ts nav.ts utils.ts activity.ts
prisma/
  schema.prisma seed.ts migrations/
auth.ts              # NextAuth config
proxy.ts              # route protection (Next.js 16's `middleware` → `proxy`)
```

## Design system

| Token | Value |
| --- | --- |
| Primary (Electric Blue) | `#0000FF` |
| Background | `#FFFFFF` |
| Surface | `#F5F7FF` |
| Text | `#1A1A2E` |
| Alert / deadline | `#FF3B3B` |
| Success | `#00C853` |
| Border | `#E0E4FF` |

Dark mode swaps background/surface/text for near-black equivalents and keeps the
electric-blue accent (brightened slightly for contrast). Cards use 8px radius,
modals 12px.
