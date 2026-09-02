# STEAM Hub

A private, single-user teaching dashboard for a Design & Technology teacher running
3D printing, architecture, robotics, branding, and product design courses (grades
8–10) within an IB framework.

> **No login screen.** This build has no authentication — anyone with the deployed
> URL can view and edit the data. Fine for a quick demo/preview link; if you deploy
> it somewhere lasting, put it behind Netlify's built-in **Visitor access** password
> (Site configuration → Visitor access) or reintroduce auth (see git history for the
> removed NextAuth setup).

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4, custom design tokens, Inter + IBM Plex Sans
- **Database:** SQLite via Prisma ORM (local file DB — `prisma/dev.db`)
- **Auth:** none — this is a private, single-user deployment with no login screen;
  every page loads straight to the dashboard against the one seeded teacher account
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
- **Settings** — profile, semester dates & breaks, and CSV-paste bulk import for
  students and courses.
- **Dark mode** — toggle in the sidebar; the electric-blue accent stays constant.

## Deploying (Netlify)

Netlify (and any serverless host) has no persistent disk, so the local SQLite
*file* (`prisma/dev.db`) won't work in production — `lib/prisma.ts` already
handles this: it uses the local file when `TURSO_DATABASE_URL` is unset (dev),
and a hosted [Turso](https://turso.tech) libSQL database when it is set (prod).
`netlify.toml` is already in the repo and points Netlify at `@netlify/plugin-nextjs`.

1. **Create a free Turso database** — [turso.tech](https://turso.tech) → sign up →
   ```bash
   turso db create steam-hub
   turso db show steam-hub --url        # -> TURSO_DATABASE_URL
   turso db tokens create steam-hub     # -> TURSO_AUTH_TOKEN
   ```
2. **Apply the schema to it** (run locally, once):
   ```bash
   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx prisma db push
   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:seed
   ```
3. **In the Netlify site → Site configuration → Environment variables**, add:
   | Key | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | from step 1 |
   | `TURSO_AUTH_TOKEN` | from step 1 |
4. **Set the branch to deploy** (Site configuration → Build & deploy → Deploy
   contexts) to `claude/steam-hub-dashboard-litwxm`, or merge it into `main` first.
5. Trigger a deploy (push a commit, or **Deploys → Trigger deploy**).

Without steps 1–3 the site will build successfully but every page that touches
the database will error at runtime — the build itself can't catch that.

## Project structure

```
app/
  (app)/            # every route, wrapped in the sidebar shell — no auth gate
    page.tsx         # dashboard
    schedule/ courses/ students/ assignments/ tasks/ projects/ settings/
components/          # UI, organized by feature folder
lib/
  actions/           # server actions (mutations), one file per domain
  current-user.ts    # fetches the single seeded teacher account (no session)
  prisma.ts constants.ts nav.ts utils.ts activity.ts
prisma/
  schema.prisma seed.ts migrations/
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
