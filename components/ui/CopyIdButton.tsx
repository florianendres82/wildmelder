'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleClick}
      title="ID kopieren"
      className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5 hover:bg-muted/80 transition-colors group"
    >
      {id.slice(0, 8).toUpperCase()}
      {copied
        ? <Check className="w-3 h-3 text-primary shrink-0" />
        : <Copy className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      }
    </button>
  )
}
