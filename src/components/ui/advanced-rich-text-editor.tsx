"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	ImageIcon,
	Italic,
	LinkIcon,
	List,
	ListOrdered,
	Quote,
	Redo,
	Save,
	Strikethrough,
	Undo,
	X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type AdvancedRichTextEditorProps = {
	content: string;
	onChange: (content: string) => void;
	onSave: () => void;
	onCancel: () => void;
	placeholder?: string;
	className?: string;
};

export function AdvancedRichTextEditor({
	content,
	onChange,
	onSave,
	onCancel,
	placeholder = "Escribe tu contenido aquí...",
	className = "",
}: AdvancedRichTextEditorProps) {
	const [showLinkDialog, setShowLinkDialog] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");

	const editor = useEditor({
		extensions: [
			StarterKit,
			Image.configure({
				HTMLAttributes: {
					class: "max-w-full h-auto rounded-lg",
				},
			}),
			Link.configure({
				openOnClick: false,
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6",
			},
		},
	});

	if (!editor) {
		return null;
	}

	const addLink = () => {
		if (linkUrl) {
			editor.chain().focus().setLink({ href: linkUrl }).run();
			setLinkUrl("");
			setShowLinkDialog(false);
		}
	};

	const addImage = () => {
		const url = window.prompt("URL de la imagen:");
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	return (
		<div
			className={`rounded-lg border border-border bg-background ${className}`}
		>
			{/* Toolbar */}
			<div className="border-border/20 border-b p-3">
				<div className="flex flex-wrap items-center gap-1">
					{/* Text formatting */}
					<Button
						className={
							editor.isActive("bold")
								? "bg-primary text-primary-foreground"
								: ""
						}
						onClick={() => editor.chain().focus().toggleBold().run()}
						size="sm"
						variant="ghost"
					>
						<Bold className="h-4 w-4" />
					</Button>
					<Button
						className={
							editor.isActive("italic")
								? "bg-primary text-primary-foreground"
								: ""
						}
						onClick={() => editor.chain().focus().toggleItalic().run()}
						size="sm"
						variant="ghost"
					>
						<Italic className="h-4 w-4" />
					</Button>
					<Button
						className={
							editor.isActive("strike")
								? "bg-primary text-primary-foreground"
								: ""
						}
						onClick={() => editor.chain().focus().toggleStrike().run()}
						size="sm"
						variant="ghost"
					>
						<Strikethrough className="h-4 w-4" />
					</Button>

					<Separator className="mx-1 h-6" orientation="vertical" />

					{/* Alignment */}
					<Button
						className={
							editor.isActive({ textAlign: "left" })
								? "bg-arsenic text-white"
								: ""
						}
						onClick={() => editor.chain().focus().setTextAlign("left").run()}
						size="sm"
						variant="ghost"
					>
						<AlignLeft className="h-4 w-4" />
					</Button>
					<Button
						className={
							editor.isActive({ textAlign: "center" })
								? "bg-arsenic text-white"
								: ""
						}
						onClick={() => editor.chain().focus().setTextAlign("center").run()}
						size="sm"
						variant="ghost"
					>
						<AlignCenter className="h-4 w-4" />
					</Button>
					<Button
						className={
							editor.isActive({ textAlign: "right" })
								? "bg-arsenic text-white"
								: ""
						}
						onClick={() => editor.chain().focus().setTextAlign("right").run()}
						size="sm"
						variant="ghost"
					>
						<AlignRight className="h-4 w-4" />
					</Button>

					<Separator className="mx-1 h-6" orientation="vertical" />

					{/* Lists */}
					<Button
						className={
							editor.isActive("bulletList") ? "bg-arsenic text-white" : ""
						}
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						size="sm"
						variant="ghost"
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						className={
							editor.isActive("orderedList") ? "bg-arsenic text-white" : ""
						}
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						size="sm"
						variant="ghost"
					>
						<ListOrdered className="h-4 w-4" />
					</Button>
					<Button
						className={
							editor.isActive("blockquote") ? "bg-arsenic text-white" : ""
						}
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						size="sm"
						variant="ghost"
					>
						<Quote className="h-4 w-4" />
					</Button>

					<Separator className="mx-1 h-6" orientation="vertical" />

					{/* Media */}
					<Button
						onClick={() => setShowLinkDialog(true)}
						size="sm"
						variant="ghost"
					>
						<LinkIcon className="h-4 w-4" />
					</Button>
					<Button onClick={addImage} size="sm" variant="ghost">
						<ImageIcon className="h-4 w-4" />
					</Button>

					<Separator className="mx-1 h-6" orientation="vertical" />

					{/* Undo/Redo */}
					<Button
						disabled={!editor.can().undo()}
						onClick={() => editor.chain().focus().undo().run()}
						size="sm"
						variant="ghost"
					>
						<Undo className="h-4 w-4" />
					</Button>
					<Button
						disabled={!editor.can().redo()}
						onClick={() => editor.chain().focus().redo().run()}
						size="sm"
						variant="ghost"
					>
						<Redo className="h-4 w-4" />
					</Button>

					<div className="flex-1" />

					{/* Actions */}
					<Button
						className="border-blackCoral bg-transparent text-blackCoral hover:bg-blackCoral hover:text-white"
						onClick={onCancel}
						size="sm"
						variant="outline"
					>
						<X className="mr-1 h-4 w-4" />
						Cancelar
					</Button>
					<Button
						className="bg-arsenic text-white hover:bg-blackCoral"
						onClick={onSave}
						size="sm"
					>
						<Save className="mr-1 h-4 w-4" />
						Guardar
					</Button>
				</div>

				{/* Link dialog */}
				{showLinkDialog && (
					<div className="mt-3 rounded-lg border border-blackCoral/20 bg-azureishWhite p-3">
						<div className="flex items-center gap-2">
							<input
								className="flex-1 rounded border border-blackCoral/20 px-3 py-1 text-sm"
								onChange={(e) => setLinkUrl(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && addLink()}
								placeholder="https://ejemplo.com"
								type="url"
								value={linkUrl}
							/>
							<Button onClick={addLink} size="sm">
								Agregar
							</Button>
							<Button
								onClick={() => setShowLinkDialog(false)}
								size="sm"
								variant="ghost"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Editor */}
			<EditorContent className="min-h-[400px]" editor={editor} />
		</div>
	);
}
