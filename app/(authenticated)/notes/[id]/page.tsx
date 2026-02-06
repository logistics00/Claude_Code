export default async function NoteEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Note Editor - {id}</h1>
    </div>
  );
}
