'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckSquare, Square } from 'lucide-react'
import UserActions from './UserActions'
import { sendErinnerungsmails } from './actions'

const ROLE_LABELS: Record<string, string> = {
  user: 'Benutzer',
  jaeger: 'Jäger',
  admin: 'Admin',
}

interface User {
  id: string
  email: string
  created_at: string
  display_name?: string | null
  role?: string | null
  is_active?: boolean | null
}

export default function JaegerSelectionList({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; errors: string[] } | null>(null)

  const allSelected = users.length > 0 && selected.size === users.length

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(users.map((u) => u.id)))
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSend() {
    setSending(true)
    setResult(null)
    try {
      const res = await sendErinnerungsmails(Array.from(selected))
      setResult(res)
      setSelected(new Set())
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {allSelected
            ? <CheckSquare className="w-4 h-4 text-primary" />
            : <Square className="w-4 h-4" />
          }
          {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
        </button>

        {selected.size > 0 && (
          <Button
            onClick={handleSend}
            disabled={sending}
            size="sm"
            className="gap-2"
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Mail className="w-4 h-4" />
            }
            {sending
              ? 'Wird gesendet…'
              : `Erinnerung senden (${selected.size})`
            }
          </Button>
        )}
      </div>

      {/* Feedback */}
      {result && (
        <div className={`text-sm rounded-xl px-4 py-3 ${
          result.errors.length === 0
            ? 'bg-primary/10 text-primary'
            : 'bg-destructive/10 text-destructive'
        }`}>
          {result.sent > 0 && (
            <p>{result.sent} Erinnerung{result.sent !== 1 ? 'en' : ''} erfolgreich gesendet.</p>
          )}
          {result.errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {users.map((user) => {
          const isSelected = selected.has(user.id)
          return (
            <Card
              key={user.id}
              className={`border-0 rounded-2xl cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/8 ring-1 ring-primary/30' : 'bg-card'
              }`}
              onClick={() => toggle(user.id)}
            >
              <CardContent className="p-5 flex items-center gap-4 flex-wrap">
                <div className="shrink-0 text-muted-foreground">
                  {isSelected
                    ? <CheckSquare className="w-5 h-5 text-primary" />
                    : <Square className="w-5 h-5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-foreground">
                      {user.display_name ?? user.email}
                    </p>
                    {user.role && (
                      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-primary/15 text-primary">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    )}
                    {!user.is_active && (
                      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-destructive/15 text-destructive">
                        Gesperrt
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Registriert: {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <UserActions
                    userId={user.id}
                    currentRole={user.role ?? null}
                    isActive={user.is_active ?? true}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}

        {users.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            Keine Jäger ohne Revier gefunden.
          </p>
        )}
      </div>
    </div>
  )
}
