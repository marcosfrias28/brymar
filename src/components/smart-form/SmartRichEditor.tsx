"use client";
import { Textarea } from "@/components/ui/textarea";

type SmartRichEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SmartRichEditor({
  value,
  onChange,
  placeholder,
}: SmartRichEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-32 rounded-xl border-2"
    />
  );
}
