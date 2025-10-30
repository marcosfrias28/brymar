"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type MarkdownRendererProps = {
	content: string;
	className?: string;
	variant?: "default" | "compact" | "rich";
};

export function MarkdownRenderer({
	content,
	className,
	variant = "default",
}: MarkdownRendererProps) {
	// Si el contenido no contiene markdown, renderizar como texto plano
	const hasMarkdown = /[*_#`[\]()>-]/.test(content);

	if (!hasMarkdown) {
		return <div className={cn("text-inherit", className)}>{content}</div>;
	}

	const baseStyles = {
		default: "prose prose-sm max-w-none text-inherit",
		compact:
			"prose prose-xs max-w-none text-inherit prose-p:my-1 prose-headings:my-2",
		rich: "prose prose-base max-w-none text-inherit prose-headings:text-inherit prose-strong:text-inherit",
	};

	return (
		<div className={cn(baseStyles[variant], className)}>
			<ReactMarkdown
				components={{
					// Personalizar elementos para mantener consistencia visual
					h1: ({ children }) => (
						<h1 className="mb-4 font-bold text-2xl text-inherit">{children}</h1>
					),
					h2: ({ children }) => (
						<h2 className="mb-3 font-semibold text-inherit text-xl">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="mb-2 font-medium text-inherit text-lg">
							{children}
						</h3>
					),
					p: ({ children }) => (
						<p className="mb-2 text-inherit leading-relaxed">{children}</p>
					),
					strong: ({ children }) => (
						<strong className="font-semibold text-inherit">{children}</strong>
					),
					em: ({ children }) => (
						<em className="text-inherit italic">{children}</em>
					),
					ul: ({ children }) => (
						<ul className="mb-2 list-inside list-disc space-y-1 text-inherit">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="mb-2 list-inside list-decimal space-y-1 text-inherit">
							{children}
						</ol>
					),
					li: ({ children }) => <li className="text-inherit">{children}</li>,
					blockquote: ({ children }) => (
						<blockquote className="my-2 border-primary/30 border-l-4 pl-4 text-inherit/80 italic">
							{children}
						</blockquote>
					),
					code: ({ children }) => (
						<code className="rounded bg-secondary/20 px-1 py-0.5 font-mono text-inherit text-sm">
							{children}
						</code>
					),
					pre: ({ children }) => (
						<pre className="my-2 overflow-x-auto rounded-lg bg-secondary/10 p-3 font-mono text-inherit text-sm">
							{children}
						</pre>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
