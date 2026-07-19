"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Quote,
  Pilcrow,
  Code2,
  Eraser,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  dir?: "rtl" | "ltr";
}

type ToolbarAction =
  | { kind: "cmd"; command: string; arg?: string }
  | { kind: "block"; tag: string }
  | { kind: "link" };

/**
 * ویرایشگر متن غنی سبک و بدون وابستگی، مخصوص مقالات بلاگ (RTL).
 * خروجی یک رشته‌ی HTML تمیز است که مستقیم در فیلد `content` بلاگ ذخیره می‌شود
 * و در فرانت داخل <article> با dangerouslySetInnerHTML رندر می‌شود.
 *
 * دو حالت دارد:
 *  - «ویرایش»: نوشتن و قالب‌بندی بصری (بولد، تیتر، لیست، لینک، نقل‌قول).
 *  - «HTML»: ویرایش سورس خام؛ برای چسباندن خروجی HTML مقاله‌ی تولیدشده با اسکیل.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "متن مقاله را بنویسید یا HTML آن را در تب «HTML» بچسبانید...",
  minHeight = 280,
  dir = "rtl",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");

  // همگام‌سازی مقدار بیرونی با DOM بدون پرش نشانگر (فقط وقتی واقعاً فرق دارد)
  useEffect(() => {
    if (mode !== "visual") return;
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value, mode]);

  const push = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const run = (action: ToolbarAction) => {
    editorRef.current?.focus();
    if (action.kind === "cmd") {
      document.execCommand(action.command, false, action.arg);
    } else if (action.kind === "block") {
      // formatBlock نیازمند نام تگ داخل <> در بعضی مرورگرهاست
      document.execCommand("formatBlock", false, `<${action.tag}>`);
    } else if (action.kind === "link") {
      const url = window.prompt("آدرس لینک را وارد کنید:", "https://");
      if (url) document.execCommand("createLink", false, url);
    }
    push();
  };

  const tools: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    action: ToolbarAction;
  }[] = [
    { icon: Bold, title: "بولد", action: { kind: "cmd", command: "bold" } },
    { icon: Italic, title: "ایتالیک", action: { kind: "cmd", command: "italic" } },
    { icon: Heading2, title: "تیتر H2", action: { kind: "block", tag: "h2" } },
    { icon: Heading3, title: "تیتر H3", action: { kind: "block", tag: "h3" } },
    { icon: Pilcrow, title: "پاراگراف", action: { kind: "block", tag: "p" } },
    { icon: List, title: "لیست نقطه‌ای", action: { kind: "cmd", command: "insertUnorderedList" } },
    { icon: ListOrdered, title: "لیست شماره‌دار", action: { kind: "cmd", command: "insertOrderedList" } },
    { icon: Quote, title: "نقل‌قول", action: { kind: "block", tag: "blockquote" } },
    { icon: Link2, title: "لینک", action: { kind: "link" } },
    { icon: Eraser, title: "پاک‌کردن قالب", action: { kind: "cmd", command: "removeFormat" } },
  ];

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      {/* نوار ابزار */}
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/40 p-1.5">
        {mode === "visual" &&
          tools.map((t, i) => (
            <button
              key={i}
              type="button"
              title={t.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(t.action)}
              className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <t.icon className="h-4 w-4" />
            </button>
          ))}
        <div className="mr-auto" />
        <button
          type="button"
          onClick={() => setMode(mode === "visual" ? "html" : "visual")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-2.5 h-8 text-xs font-medium transition-colors",
            mode === "html"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          <Code2 className="h-4 w-4" />
          {mode === "html" ? "نمای ویرایش" : "HTML"}
        </button>
      </div>

      {mode === "visual" ? (
        <div
          ref={editorRef}
          dir={dir}
          contentEditable
          suppressContentEditableWarning
          onInput={push}
          onBlur={push}
          data-placeholder={placeholder}
          className={cn(
            "prose prose-sm max-w-none px-4 py-3 outline-none",
            "prose-headings:font-bold prose-a:text-primary",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none",
          )}
          style={{ minHeight }}
        />
      ) : (
        <textarea
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>HTML مقاله را اینجا بچسبانید...</p>"
          spellCheck={false}
          className="w-full resize-y bg-background px-4 py-3 font-mono text-xs leading-6 outline-none"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
