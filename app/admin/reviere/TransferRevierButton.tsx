'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft } from 'lucide-react'
import RevierTransferForm from '@/components/forms/RevierTransferForm'

export default function TransferRevierButton({ revierId, revierName }: { revierId: string; revierName: string }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
        Übertragen
      </Button>
    )
  }

  return (
    <div className="w-full mt-3 pt-3 border-t border-border">
      <p className="text-sm font-medium text-foreground mb-3">
        „{revierName}" übertragen an:
      </p>
      <RevierTransferForm revierId={revierId} />
    </div>
  )
}
