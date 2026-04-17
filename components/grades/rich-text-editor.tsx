"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import { useRef, type ReactNode } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Undo2, Redo2, RemoveFormatting,
  Highlighter, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSizeExtension = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types as string[],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize || null,
            renderHTML: (attrs: Record<string, unknown>) => {
              const size = attrs.fontSize as string | null;
              if (!size) return {};
              return { style: `font-size: ${size}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const FONT_SIZES = ["11", "12", "13", "14", "16", "18", "20", "24", "28", "32", "36", "48"];

function RichToolbarSep() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-border/60" />;
}

function RichToolbarBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded transition-colors shrink-0",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  minHeight = "180px",
  className,
}: RichTextEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    /** Evita mismatch de hidratação com App Router / SSR (Tiptap). */
    immediatelyRender: false,
    extensions: [
      /** StarterKit já inclui Underline — não importar @tiptap/extension-underline outra vez. */
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      FontSizeExtension,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "grade-rich-editor outline-none w-full px-3 py-2.5",
        style: `min-height: ${minHeight};`,
      },
    },
  });

  if (!editor) return null;

  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined)?.replace("px", "") ?? "";
  const currentHeading = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
    ? "2"
    : editor.isActive("heading", { level: 3 })
    ? "3"
    : "0";

  const selectClass =
    "h-7 rounded border border-border/60 bg-background px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer";

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border/60 bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/30 px-2 py-1.5">
        <RichToolbarBtn title="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn title="Refazer" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarSep />

        <select
          value={currentHeading}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "0") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(val) as 1 | 2 | 3 })
                .run();
          }}
          className={cn(selectClass, "w-28")}
        >
          <option value="0">Parágrafo</option>
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
        </select>

        <select
          value={currentFontSize}
          onChange={(e) => {
            const val = e.target.value;
            if (val) editor.chain().focus().setFontSize(`${val}px`).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          className={cn(selectClass, "w-[4.5rem]")}
        >
          <option value="">Tam.</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <RichToolbarSep />

        <RichToolbarBtn
          title="Negrito (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Itálico (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Sublinhado (Ctrl+U)"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Tachado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarSep />

        {/* Text color */}
        <div className="relative">
          <RichToolbarBtn title="Cor do texto" onClick={() => colorInputRef.current?.click()}>
            <Palette className="h-3.5 w-3.5" />
          </RichToolbarBtn>
          <input
            ref={colorInputRef}
            type="color"
            className="pointer-events-none absolute inset-0 h-0 w-0 opacity-0"
            onInput={(e) =>
              editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
            }
          />
        </div>

        {/* Highlight */}
        <div className="relative">
          <RichToolbarBtn
            title="Marca-texto"
            active={editor.isActive("highlight")}
            onClick={() => highlightInputRef.current?.click()}
          >
            <Highlighter className="h-3.5 w-3.5" />
          </RichToolbarBtn>
          <input
            ref={highlightInputRef}
            type="color"
            className="pointer-events-none absolute inset-0 h-0 w-0 opacity-0"
            onInput={(e) =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: (e.target as HTMLInputElement).value })
                .run()
            }
          />
        </div>
        <RichToolbarSep />

        <RichToolbarBtn
          title="Alinhar à esquerda"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Centralizar"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Alinhar à direita"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Justificar"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarSep />

        <RichToolbarBtn
          title="Lista com marcadores"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarBtn
          title="Citação"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </RichToolbarBtn>
        <RichToolbarSep />

        <RichToolbarBtn
          title="Limpar formatação"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </RichToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
