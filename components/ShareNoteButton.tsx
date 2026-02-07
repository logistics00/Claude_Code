"use client";
import { useRef, useState } from "react";

type ShareNoteButtonProps = {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
};

export function ShareNoteButton({
  noteId,
  initialIsPublic,
  initialSlug,
}: ShareNoteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    setError(null);
  }

  async function handleToggle() {
    setIsPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public: !isPublic }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update sharing");
        return;
      }

      const data = await res.json();
      setIsPublic(data.is_public);
      setSlug(data.public_slug);
    } catch {
      setError("Failed to update sharing");
    } finally {
      setIsPending(false);
    }
  }

  function getPublicUrl() {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/p/${slug}`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getPublicUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Share
      </button>
      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 rounded-lg p-0 backdrop:bg-black/50 bg-white dark:bg-gray-800"
      >
        <div className="p-6 w-96">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Share Note
          </h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Make note public
            </span>
            <button
              type="button"
              onClick={handleToggle}
              disabled={isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              } ${isPending ? "opacity-50" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {isPublic && slug && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Public URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getPublicUrl()}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
