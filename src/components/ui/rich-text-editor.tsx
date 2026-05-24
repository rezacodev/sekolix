"use client";

import { useEffect } from "react";
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  NodeViewContent,
  NodeViewWrapper
} from "@tiptap/react";
import type { AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading2,
  Link as LinkIcon,
  ImageIcon
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImagePick?: () => Promise<string | null | undefined>;
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: element => element.getAttribute("width") || "100%",
        renderHTML: attributes => {
          return {
            width: attributes.width || "100%",
            style: `width: ${attributes.width || "100%"}; height: auto;`
          };
        }
      }
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  }
});

function ResizableImageView({
  node,
  updateAttributes,
  selected
}: {
  node: unknown;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  selected: boolean;
}) {
  // Type guard for node
  if (typeof node !== "object" || node === null || !("attrs" in node)) {
    return null;
  }

  const nodeData = node as { attrs: { width?: string; src?: string; alt?: string } };
  const widthStr = (nodeData.attrs.width as string) || "100%";
  const widthNum = parseInt(widthStr.replace("%", ""), 10) || 100;

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget.parentElement as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const startX = e.clientX;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const newWidthPx = (rect.width * widthNum) / 100 + delta;
      const percent = Math.min(100, Math.max(30, (newWidthPx / rect.width) * 100));
      updateAttributes({ width: `${Math.round(percent)}%` });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <NodeViewWrapper style={{ display: "inline-block", position: "relative", width: widthStr }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={(nodeData.attrs.src as string) || ""}
        alt={(nodeData.attrs.alt as string) || ""}
        style={{ width: "100%", height: "auto" }}
      />
      {selected && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "2px solid #3b82f6",
              pointerEvents: "none"
            }}
          />
          <div
            onMouseDown={onDrag}
            style={{
              position: "absolute",
              right: -6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 12,
              height: 12,
              background: "#3b82f6",
              borderRadius: "50%",
              cursor: "ew-resize"
            }}
          />
        </>
      )}
      <NodeViewContent style={{ display: "none" }} />
    </NodeViewWrapper>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something amazing...",
  onImagePick
}: RichTextEditorProps) {
  const editor = useEditor({
    // build extensions and dedupe by name to avoid duplicate-extension warnings
    extensions: (() => {
      const exts: AnyExtension[] = [
        StarterKit,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline"
          }
        }),
        ResizableImage,
        Placeholder.configure({ placeholder })
      ];
      const seen = new Set<string>();
      const unique: AnyExtension[] = [];
      const getExtensionName = (ext: AnyExtension | undefined): string => {
        if (!ext) return "";
        if (typeof ext === "function" && (ext as unknown & { name?: string }).name)
          return (ext as unknown & { name?: string }).name || "";
        const maybe = ext as unknown as Record<string, unknown> | undefined;
        if (maybe && typeof maybe.name === "string") return maybe.name as string;
        const cfg = (maybe && (maybe.config as Record<string, unknown> | undefined)) || undefined;
        if (cfg && typeof cfg.name === "string") return cfg.name as string;
        return "";
      };
      for (const e of exts) {
        const name = getExtensionName(e);
        if (!name) {
          unique.push(e);
          continue;
        }
        if (seen.has(name)) {
          continue;
        }
        seen.add(name);
        unique.push(e);
      }
      return unique;
    })(),
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] max-w-none p-4"
      }
    }
  });

  // Update editor content when `content` prop changes after initialization
  useEffect(() => {
    if (!editor) return;
    try {
      if (content === null || content === undefined) return;
      // Use setContent to replace editor content with incoming value
      editor.commands.setContent(content);
    } catch (e) {
      // ignore invalid content
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = async () => {
    if (onImagePick) {
      const url = await onImagePick();
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      return;
    }

    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-muted" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive("link") ? "bg-muted" : ""}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        {editor.isActive("image") && (
          <div className="flex items-center gap-2 pl-2 text-xs text-muted-foreground">
            <span>Size</span>
            <input
              type="range"
              min={30}
              max={100}
              value={parseInt(editor.getAttributes("image").width || "100", 10) || 100}
              onChange={e => {
                const value = `${e.target.value}%`;
                editor.chain().focus().updateAttributes("image", { width: value }).run();
              }}
              className="h-2 w-28 cursor-pointer"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                editor.chain().focus().updateAttributes("image", { width: "100%" }).run()
              }
            >
              Reset
            </Button>
          </div>
        )}
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="bg-background" />
    </div>
  );
}
