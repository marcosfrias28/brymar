"use client";

import ReactMarkdown from "react-markdown";
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: "default" | "compact" | "rich";
}

export function MarkdownRenderer({ 
  content, 
  className, 
  variant = "default" 
}: MarkdownRendererProps) {
  // Si el contenido no contiene markdown, renderizar como texto plano
  const hasMarkdown = /[*_#`\[\]()>-]/.test(content);
  
  if (!hasMarkdown) {
    return (
      <div className={cn("text-inherit", className)}>
        {content}
      </div>
    );
  }

  const baseStyles = {
    default: "prose prose-sm max-w-none text-inherit",
    compact: "prose prose-xs max-w-none text-inherit prose-p:my-1 prose-headings:my-2",
    rich: "prose prose-base max-w-none text-inherit prose-headings:text-inherit prose-strong:text-inherit"
  };

  return (
    <div className={cn(baseStyles[variant], className)}>
      <ReactMarkdown
        components={{
          // Personalizar elementos para mantener consistencia visual
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-inherit">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-inherit">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 text-inherit">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 text-inherit leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-inherit">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-inherit">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 text-inherit">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 text-inherit">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-inherit">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-inherit/80 my-2">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-secondary/20 px-1 py-0.5 rounded text-sm font-mono text-inherit">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-secondary/10 p-3 rounded-lg overflow-x-auto text-sm font-mono text-inherit my-2">
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