import { run, get, query } from "./db";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export function createNote(
  userId: string,
  title: string,
  contentJson: string
): string {
  const id = crypto.randomUUID();
  run(
    `INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)`,
    [id, userId, title, contentJson]
  );
  return id;
}

export function getNoteById(id: string, userId: string): Note | undefined {
  return get<Note>(
    `SELECT * FROM notes WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
}

export function getNotesByUserId(userId: string): Note[] {
  return query<Note>(
    `SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  );
}

export function updateNote(
  id: string,
  userId: string,
  title: string,
  contentJson: string
): boolean {
  run(
    `UPDATE notes SET title = ?, content_json = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
    [title, contentJson, id, userId]
  );
  return true;
}

export function deleteNote(id: string, userId: string): boolean {
  run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [id, userId]);
  return true;
}
