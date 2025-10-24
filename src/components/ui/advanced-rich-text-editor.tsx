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

interface AdvancedRichTextEditorProps {
	content: string;
	onChange: (content: string) => void;
	onSave: () => void;
	onCancel: () => void;
	placeholder?: string;
	className?: string;
}

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
			className={`border border-border rounded-lg bg-background ${className}`}
		>
			{/* Toolbar */}
			<div className="border-b border-border/20 p-3">
				<div className="flex flex-wrap items-center gap-1">
					{/* Text formatting */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBold().run()}
						className={
							editor.isActive("bold")
								? "bg-primary text-primary-foreground"
								: ""
						}
					>
						<Bold className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						className={
							editor.isActive("italic")
								? "bg-primary text-primary-foreground"
								: ""
						}
					>
						<Italic className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleStrike().run()}
						className={
							editor.isActive("strike")
								? "bg-primary text-primary-foreground"
								: ""
						}
					>
						<Strikethrough className="h-4 w-4" />
					</Button>

					<Separator orientation="vertical" className="h-6 mx-1" />

					{/* Alignment */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().setTextAlign("left").run()}
						className={
							editor.isActive({ textAlign: "left" })
								? "bg-arsenic text-white"
								: ""
						}
					>
						<AlignLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().setTextAlign("center").run()}
						className={
							editor.isActive({ textAlign: "center" })
								? "bg-arsenic text-white"
								: ""
						}
					>
						<AlignCenter className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().setTextAlign("right").run()}
						className={
							editor.isActive({ textAlign: "right" })
								? "bg-arsenic text-white"
								: ""
						}
					>
						<AlignRight className="h-4 w-4" />
					</Button>

					<Separator orientation="vertical" className="h-6 mx-1" />

					{/* Lists */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={
							editor.isActive("bulletList") ? "bg-arsenic text-white" : ""
						}
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className={
							editor.isActive("orderedList") ? "bg-arsenic text-white" : ""
						}
					>
						<ListOrdered className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						className={
							editor.isActive("blockquote") ? "bg-arsenic text-white" : ""
						}
					>
						<Quote className="h-4 w-4" />
					</Button>

					<Separator orientation="vertical" className="h-6 mx-1" />

					{/* Media */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowLinkDialog(true)}
					>
						<LinkIcon className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="sm" onClick={addImage}>
						<ImageIcon className="h-4 w-4" />
					</Button>

					<Separator orientation="vertical" className="h-6 mx-1" />

					{/* Undo/Redo */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().undo()}
					>
						<Undo className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().redo()}
					>
						<Redo className="h-4 w-4" />
					</Button>

					<div className="flex-1" />

					{/* Actions */}
					<Button
						variant="outline"
						size="sm"
						onClick={onCancel}
						className="border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white bg-transparent"
					>
						<X className="h-4 w-4 mr-1" />
						Cancelar
					</Button>
					<Button
						size="sm"
						onClick={onSave}
						className="bg-arsenic hover:bg-blackCoral text-white"
					>
						<Save className="h-4 w-4 mr-1" />
						Guardar
					</Button>
				</div>

				{/* Link dialog */}
				{showLinkDialog && (
					<div className="mt-3 p-3 border border-blackCoral/20 rounded-lg bg-azureishWhite">
						<div className="flex items-center gap-2">
							<input
								type="url"
								placeholder="https://ejemplo.com"
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
								className="flex-1 px-3 py-1 border border-blackCoral/20 rounded text-sm"
								onKeyDown={(e) => e.key === "Enter" && addLink()}
							/>
							<Button size="sm" onClick={addLink}>
								Agregar
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setShowLinkDialog(false)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Editor */}
			<EditorContent editor={editor} className="min-h-[400px]" />
		</div>
	);
}
