import { run, get, query } from "./db";

const MAX_CONTENT_SIZE = 500 * 1024; // 500KB

export function validateContentJson(contentJson: string): { valid: boolean; error?: string } {
  if (contentJson.length > MAX_CONTENT_SIZE) {
    return { valid: false, error: `Content exceeds maximum size of ${MAX_CONTENT_SIZE / 1024}KB` };
  }
  try {
    const parsed = JSON.parse(contentJson);
    if (typeof parsed !== "object" || parsed === null) {
      return { valid: false, error: "Content must be a valid JSON object" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Content is not valid JSON" };
  }
}

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
  const changes = run(
    `UPDATE notes SET title = ?, content_json = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
    [title, contentJson, id, userId]
  );
  return changes > 0;
}

export function deleteNote(id: string, userId: string): boolean {
  const changes = run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [id, userId]);
  return changes > 0;
}
