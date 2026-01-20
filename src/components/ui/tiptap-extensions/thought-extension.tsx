import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Brain, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const ThoughtComponent = ({ node, updateAttributes, extension }: any) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <NodeViewWrapper className="my-4">
      <div className="border border-warning-200 rounded-lg overflow-hidden bg-warning-50/30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 p-2 text-xs font-medium text-warning-700 hover:bg-warning-100/50 transition-colors text-left"
          contentEditable={false}
        >
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <Brain className="w-3 h-3" />
          {isOpen ? 'Hide Thinking Process' : 'Thinking Process... (Click to expand)'}
        </button>
        
        {isOpen && (
          <div className="p-3 border-t border-warning-200 bg-warning-50/50 text-xs font-mono text-warning-800 leading-relaxed whitespace-pre-wrap">
             <NodeViewContent />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const ThoughtExtension = Node.create({
  name: 'thought',

  group: 'block',

  content: 'inline*', // DeepSeek thoughts are usually text paragraphs

  parseHTML() {
    return [
      { tag: 'think' },
      { tag: 'div[data-type="thought"]' }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'thought' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ThoughtComponent)
  },
})
