'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

export default function RevierDeleteButton({ revierId }: { revierId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('reviere').delete().eq('id', revierId)
    if (err) {
      setError(err.message)
      setLoading(false)
      setConfirm(false)
    } else {
      router.push('/reviere')
      router.refresh()
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        {error && <p className="text-sm text-destructive flex-1">{error}</p>}
        <p className="text-sm text-destructive flex-1">Revier wirklich löschen?</p>
        <Button variant="outline" size="sm" onClick={() => setConfirm(false)} disabled={loading}>
          Abbrechen
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
          {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          Löschen
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="w-4 h-4 mr-1.5" />
      Revier löschen
    </Button>
  )
}
