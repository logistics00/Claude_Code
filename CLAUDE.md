# CLAUDE.md

We’re building the app described in @Specification_Technical.md. Read that file for general 
architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, 
claudeno long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official 
documentation to ensure that you're working with up-to-date information. 
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A note-taking web application where authenticated users can create, view, edit, delete, and publicly 
share rich-text notes. Notes use TipTap editor and are stored as JSON in SQLite.

## Commands

```bash
bun dev          # Start development server (http://localhost:3000)
bun run build    # Production build
bun run start    # Start production server
bun run lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) with Bun runtime
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** better-auth (email/password)
- **Editor:** TipTap with StarterKit
- **Database:** SQLite via Bun's SQLite client (raw SQL)
- **Validation:** Zod

## Architecture

### Application Layers

1. **Presentation:** Next.js pages/components with TailwindCSS and TipTap editor
2. **API:** REST-like JSON endpoints via Route Handlers (`app/api/.../route.ts`)
3. **Data Access:** Raw SQL queries via Bun's SQLite client with helper module

### Key Files (to be created per spec)

- `lib/db.ts` - SQLite connection and query helpers (`getDb()`, `query<T>()`, `get<T>()`, `run()`)
- `lib/notes.ts` - Note repository functions (CRUD operations scoped by user_id)

### Routes Structure

- `/` - Landing page
- `/dashboard` - Authenticated notes list
- `/notes/[id]` - Note editor (authenticated)
- `/p/[slug]` - Public note view (read-only, unauthenticated access)

### API Endpoints

- `GET/POST /api/notes` - List/create notes
- `GET/PUT/DELETE /api/notes/:id` - Single note operations
- `POST /api/notes/:id/share` - Toggle public sharing
- `GET /api/public-notes/:slug` - Public note read access

## Database

SQLite file at `data/app.db`. Tables:
- `user`, `session`, `account`, `verification` - better-auth managed
- `notes` - App data (id, user_id, title, content_json, is_public, public_slug, timestamps)

## TipTap Configuration

Extensions: StarterKit (headings H1-H3, bold, italic, bullet lists, horizontal rule), Code, CodeBlock. Content stored as JSON string in `content_json` column.
