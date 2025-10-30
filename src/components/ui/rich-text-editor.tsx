"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	Heading2,
	Heading3,
	Italic,
	List,
	ListOrdered,
	Quote,
	Redo,
	Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	className?: string;
};

export function RichTextEditor({
	content,
	onChange,
	placeholder,
	className,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-4",
			},
		},
	});

	if (!editor) {
		return null;
	}

	return (
		<div className={cn("rounded-lg border border-blackCoral", className)}>
			{/* Toolbar */}
			<div className="flex flex-wrap gap-1 border-blackCoral border-b p-2">
				<Button
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("bold") ? "bg-arsenic text-white" : ""
					)}
					onClick={() => editor.chain().focus().toggleBold().run()}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Bold className="h-4 w-4" />
				</Button>

				<Button
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("italic") ? "bg-arsenic text-white" : ""
					)}
					onClick={() => editor.chain().focus().toggleItalic().run()}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Italic className="h-4 w-4" />
				</Button>

				<Button
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("heading", { level: 2 })
							? "bg-arsenic text-white"
							: ""
					)}
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Heading2 className="h-4 w-4" />
				</Button>

				<Button
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("heading", { level: 3 })
							? "bg-arsenic text-white"
							: ""
					)}
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Heading3 className="h-4 w-4" />
				</Button>

				<Button
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("bulletList") ? "bg-arsenic text-white" : ""
					)}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					size="sm"
					type="button"
					variant="ghost"
				>
					<List className="h-4 w-4" />
				</Button>

				<Button
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("orderedList") ? "bg-arsenic text-white" : ""
					)}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					size="sm"
					type="button"
					variant="ghost"
				>
					<ListOrdered className="h-4 w-4" />
				</Button>

				<Button
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("blockquote") ? "bg-arsenic text-white" : ""
					)}
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Quote className="h-4 w-4" />
				</Button>

				<div className="mx-1 h-6 w-px bg-blackCoral" />

				<Button
					className="h-8 w-8 p-0"
					disabled={!editor.can().undo()}
					onClick={() => editor.chain().focus().undo().run()}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Undo className="h-4 w-4" />
				</Button>

				<Button
					className="h-8 w-8 p-0"
					disabled={!editor.can().redo()}
					onClick={() => editor.chain().focus().redo().run()}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Redo className="h-4 w-4" />
				</Button>
			</div>

			{/* Editor */}
			<EditorContent
				className="max-h-[400px] min-h-[120px] overflow-y-auto"
				editor={editor}
			/>

			{placeholder && !content && (
				<div className="pointer-events-none absolute top-12 left-4 text-gray-400">
					{placeholder}
				</div>
			)}
		</div>
	);
}
