"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type TipTapEditorProps = {
  content: string;
  onUpdate: (json: string) => void;
};

export function TipTapEditor({ content, onUpdate }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: content ? JSON.parse(content) : { type: "doc", content: [] },
    onUpdate: ({ editor }) => {
      onUpdate(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] focus:outline-none p-4",
        "aria-label": "Note content editor",
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      if (currentContent !== content) {
        editor.commands.setContent(JSON.parse(content));
      }
    }
  }, [editor, content]);

  return (
    <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <EditorContent editor={editor} />
    </div>
  );
}
