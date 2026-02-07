import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById, deleteNote } from "@/lib/notes";
import { NoteRenderer } from "@/components/NoteRenderer";
import { DeleteNoteButton } from "@/components/DeleteNoteButton";
import { ShareNoteButton } from "@/components/ShareNoteButton";

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

  async function deleteNoteAction() {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession) {
      redirect("/authenticate");
    }

    const deleted = deleteNote(id, currentSession.user.id);
    if (!deleted) {
      return { error: "Failed to delete note" };
    }

    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          &larr; Back to Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/notes/${id}/edit`}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit
          </Link>
          <ShareNoteButton
            noteId={id}
            initialIsPublic={Boolean(note.is_public)}
            initialSlug={note.public_slug}
          />
          <DeleteNoteButton deleteAction={deleteNoteAction} />
        </div>
      </div>
      <article>
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          {note.title || "Untitled"}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
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
