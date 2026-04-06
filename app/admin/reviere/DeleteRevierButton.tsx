'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteRevierButton({ revierId }: { revierId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Revier wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('reviere').delete().eq('id', revierId)
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive shrink-0"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}
