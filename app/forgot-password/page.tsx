'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthCard from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthCard
        title="E-Mail gesendet"
        description="Prüfen Sie Ihren Posteingang"
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">
            Wir haben einen Link zum Zurücksetzen Ihres Passworts an{' '}
            <strong className="text-foreground">{email}</strong> gesendet.
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
      title="Passwort vergessen?"
      description="Wir senden Ihnen einen Link zum Zurücksetzen"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse</Label>
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
          {loading ? 'Wird gesendet…' : 'Link anfordern'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary font-medium hover:underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </AuthCard>
  )
}
