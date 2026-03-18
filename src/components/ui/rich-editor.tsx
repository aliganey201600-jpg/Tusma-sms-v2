"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Eraser,
  Highlighter,
  ChevronDown
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  tooltip
}: { 
  onClick: () => void, 
  isActive?: boolean, 
  disabled?: boolean, 
  children: React.ReactNode,
  tooltip?: string
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    className={cn(
      "h-9 w-9 rounded-xl transition-all duration-300",
      isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
    )}
    title={tooltip}
  >
    {children}
  </Button>
)

export function RichEditor({ content, onChange, placeholder, className }: RichEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your lesson...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TextStyle,
      Color,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-slate max-w-none focus:outline-none min-h-[500px] p-10 text-lg leading-relaxed text-slate-700",
          "prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-slate-900",
          "prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1",
          "prose-strong:text-slate-900 prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:p-6 prose-blockquote:rounded-2xl"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Synchronize content from outside (e.g. from AI)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!isMounted || !editor) return (
     <div className={cn("w-full min-h-[600px] bg-slate-50 animate-pulse rounded-[40px] border border-slate-100", className)} />
  )

  return (
    <div className={cn("group flex flex-col w-full bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden transition-all focus-within:ring-4 focus-within:ring-indigo-100/50", className)}>
      {/* MS Word Inspired Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-white border-b border-slate-50 sticky top-0 z-20 backdrop-blur-xl bg-white/90">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-100">
           <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo (Ctrl+Z)"><Undo className="h-4 w-4" /></MenuButton>
           <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo (Ctrl+Shift+Z)"><Redo className="h-4 w-4" /></MenuButton>
        </div>

        {/* Text Style / Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-3 gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 border border-slate-50">
               {editor.isActive('heading', { level: 1 }) ? 'Title H1' : 
                editor.isActive('heading', { level: 2 }) ? 'Subtitle H2' : 
                editor.isActive('heading', { level: 3 }) ? 'Section H3' : 'Normal Text'}
               <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-2xl border-none shadow-2xl p-2 min-w-[200px]">
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} className="rounded-xl px-4 py-3 cursor-pointer group">
              <Type className="h-4 w-4 mr-3 text-slate-400 group-hover:text-indigo-600" />
              <span className="text-sm font-medium">Paragraph</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="rounded-xl px-4 py-3 cursor-pointer group">
              <Heading1 className="h-4 w-4 mr-3 text-slate-400 group-hover:text-indigo-600" />
              <span className="text-sm font-black uppercase">Main Heading</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="rounded-xl px-4 py-3 cursor-pointer group">
              <Heading2 className="h-4 w-4 mr-3 text-slate-400 group-hover:text-indigo-600" />
              <span className="text-sm font-black uppercase">Sub Heading</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="rounded-xl px-4 py-3 cursor-pointer group">
              <Heading3 className="h-4 w-4 mr-3 text-slate-400 group-hover:text-indigo-600" />
              <span className="text-sm font-black uppercase">Minor Section</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-slate-100 mx-1" />

        {/* Character Formatting */}
        <div className="flex items-center gap-1">
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} tooltip="Bold (Ctrl+B)"><Bold className="h-4 w-4" /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} tooltip="Italic (Ctrl+I)"><Italic className="h-4 w-4" /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} tooltip="Underline (Ctrl+U)"><UnderlineIcon className="h-4 w-4" /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} tooltip="Strikethrough"><Strikethrough className="h-4 w-4" /></MenuButton>
        </div>

        <div className="h-6 w-px bg-slate-100 mx-1" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} tooltip="Align Left"><AlignLeft className="h-4 w-4" /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} tooltip="Align Center"><AlignCenter className="h-4 w-4" /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} tooltip="Align Right"><AlignRight className="h-4 w-4" /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} tooltip="Justify"><AlignJustify className="h-4 w-4" /></MenuButton>
        </div>

        <div className="h-6 w-px bg-slate-100 mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} tooltip="Bullet List"><List className="h-4 w-4" /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} tooltip="Numbered List"><ListOrdered className="h-4 w-4" /></MenuButton>
        </div>

        <div className="h-6 w-px bg-slate-100 mx-1" />

        {/* Highlights & Colors */}
        <div className="flex items-center gap-1">
           <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} tooltip="Highlight"><Highlighter className="h-4 w-4" /></MenuButton>
           <MenuButton onClick={() => editor.chain().focus().unsetAllMarks().run()} tooltip="Clear Formatting"><Eraser className="h-4 w-4" /></MenuButton>
        </div>

        <div className="h-6 w-px bg-slate-100 mx-1" />

        {/* Insert */}
        <div className="flex items-center gap-1">
           <MenuButton 
             onClick={() => {
               const url = window.prompt('URL:')
               if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
             }} 
             isActive={editor.isActive('link')} 
             tooltip="Insert Link"
           >
             <LinkIcon className="h-4 w-4" />
           </MenuButton>
           <MenuButton 
             onClick={() => {
               const url = window.prompt('Image URL:')
               if (url) editor.chain().focus().setImage({ src: url }).run()
             }} 
             tooltip="Insert Image"
           >
             <ImageIcon className="h-4 w-4" />
           </MenuButton>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="bg-white/50 relative">
        <EditorContent 
           editor={editor} 
           className="min-h-[500px]"
        />
        <div className="absolute bottom-4 right-8 flex items-center gap-3">
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Composition Suite v1.0</span>
           <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
