# Note Taking Web App

## Overview

A web application where users can create and manage notes. A "note" is simply a piece of text, created via a rich text editor (TipTap).

## Features

Authenticated users will be able to:

- Create, view, update and delete notes
- Share notes publicly (and also stop sharing)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js with Bun & TypeScript |
| Styling | TailwindCSS |
| Authentication | better-auth |
| Rich Text Editor | TipTap |
| Database | SQLite (Bun's built-in client with raw SQL) |

## Rich Text Formatting

The editor will support:

- **Bold**, *Italic*
- 3 Heading Levels + Normal Text
- `Inline Code` + Code Snippets
- Bullet point lists
- Horizontal separator lines

## Data Storage

Notes will be stored as JSON in a SQLite database.

---

> **Question:** Do you need more information to create a technical specification document which can be used as a foundation to build this application?
