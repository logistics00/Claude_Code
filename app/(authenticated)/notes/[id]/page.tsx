import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import { NoteRenderer } from "@/components/NoteRenderer";

export default async function NoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    notFound();
  }

  const note = getNoteById(id, session.user.id);

  if (!note) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
      <article>
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          {note.title || "Untitled"}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Last updated {new Date(note.updated_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <NoteRenderer content={note.content_json} />
      </article>
    </div>
  );
}
