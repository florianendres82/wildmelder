'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface UserActionsProps {
  userId: string
  currentRole: string | null
  isActive: boolean
}

const ROLES = [
  { value: null, label: 'Kein' },
  { value: 'jaeger', label: 'Jäger' },
  { value: 'admin', label: 'Admin' },
]

export default function UserActions({ userId, currentRole, isActive }: UserActionsProps) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  async function updateRole(newRole: string | null) {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    setRole(newRole)
    setLoading(false)
    router.refresh()
  }

  async function toggleActive() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ is_active: !active })
      .eq('id', userId)
    setActive(!active)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap shrink-0">
      {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      <select
        value={role ?? ''}
        onChange={(e) => updateRole(e.target.value || null)}
        disabled={loading}
        className="text-sm border border-input rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {ROLES.map((r) => (
          <option key={r.value ?? 'none'} value={r.value ?? ''}>
            {r.label}
          </option>
        ))}
      </select>
      <Button
        variant={active ? 'destructive' : 'outline'}
        size="sm"
        onClick={toggleActive}
        disabled={loading}
        className="h-8 text-xs"
      >
        {active ? 'Sperren' : 'Entsperren'}
      </Button>
    </div>
  )
}
