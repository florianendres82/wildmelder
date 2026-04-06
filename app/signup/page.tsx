'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthCard from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <AuthCard
        title="Fast fertig!"
        description="Bitte bestätigen Sie Ihre E-Mail-Adresse"
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">
            Wir haben eine Bestätigungs-E-Mail an{' '}
            <strong className="text-foreground">{email}</strong> gesendet.
            Klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
          </p>
          <Link href="/login" className="text-primary font-medium hover:underline text-sm">
            Zurück zur Anmeldung
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Jäger-Konto erstellen"
      description="Registrieren Sie sich, um Ihr Revier zu verwalten"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Max Mustermann"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mindestens 8 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-base font-semibold"
          disabled={loading}
        >
          {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Bereits registriert?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Anmelden
        </Link>
      </p>
    </AuthCard>
  )
}
