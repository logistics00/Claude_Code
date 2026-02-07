import { notFound } from "next/navigation";
import { getPublicNoteBySlug } from "@/lib/notes";
import { NoteRenderer } from "@/components/NoteRenderer";

export default async function PublicNote({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getPublicNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <article>
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            {note.title || "Untitled"}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            Last updated{" "}
            {new Date(note.updated_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <NoteRenderer content={note.content_json} />
        </article>
      </div>
    </div>
  );
}
