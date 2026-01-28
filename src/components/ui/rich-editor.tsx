'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, Wand2, Loader2 } from 'lucide-react'
import { Button } from '@heroui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { generateDescription } from '@/app/dashboard/actions'

import { ThoughtExtension } from './tiptap-extensions/thought-extension'

// ... existing imports

export interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  issueTitle?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Add a description...',
  issueTitle
}: RichTextEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ThoughtExtension, // Register our new Thinking UI extension
      Placeholder.configure({
        placeholder,
      }),
    ],
    immediatelyRender: false,
    content: content || '', 
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[150px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  const handleGenerateValues = async () => {
    console.log("Magic Wand Clicked", { issueTitle })
    
    if (!editor) return
    if (!issueTitle) {
      alert("Please add a title to generate a description.")
      return
    }
    
    setIsGenerating(true)
    try {
      const markdown = await generateDescription(issueTitle)
      
      // Since our ThoughtExtension defines parseHTML for <think> tags,
      // and the backend returns raw content with <think>...</think>,
      // Tiptap's setContent should automatically parse it into the ThoughtNode!
      editor.commands.setContent(markdown) 
      
    } catch (error) {
      console.error(error)
      editor.commands.setContent("Failed to connect to OpenRouter AI.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border border-default-200 rounded-lg overflow-hidden transition-colors hover:bg-default-100/50 focus-within:border-primary bg-content1">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-default-200 p-2 bg-default-50">
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={() => editor.chain().focus().toggleBold().run()}
          className={clsx(editor.isActive('bold') && 'bg-default-200')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(editor.isActive('italic') && 'bg-default-200')}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx(editor.isActive('bulletList') && 'bg-default-200')}
        >
          <List className="w-4 h-4" />
        </Button>
        
        <div className="flex-1" />
        
        <Button
          isIconOnly // HeroUI prop
          variant="ghost" // Reverted to valid variant
          size="sm"
          onPress={handleGenerateValues}
          isDisabled={isGenerating} // Removed !issueTitle to let it be clickable but show alert if empty
          aria-label="Generate description with AI"
          className="cursor-pointer hover:bg-default-100 rounded-md p-1 min-w-8 w-8 h-8 text-primary"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        </Button>
      </div>

      <EditorContent editor={editor} />
      
      {/* Hidden input for form submission if needed, but we likely handle it via onChange in the parent */}
    </div>
  )
}
