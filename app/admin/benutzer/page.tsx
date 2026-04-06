import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
import { Card, CardContent } from '@/components/ui/card'
import UserActions from './UserActions'

export const metadata: Metadata = {
  title: 'Benutzerverwaltung | Admin | Wildmelder',
}

const ROLE_LABELS: Record<string, string> = {
  jaeger: 'Jäger',
  admin: 'Admin',
}

export default async function BenutzerPage() {
  const admin = createAdminClient()

  // Get all users from auth.users (requires service role)
  const { data: authUsers } = await admin.auth.admin.listUsers()

  // Get all profiles
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, role, is_active, created_at')

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])

  const users = authUsers?.users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    created_at: u.created_at,
    ...profileMap.get(u.id),
  })) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Benutzerverwaltung</h1>
      <p className="text-muted-foreground mb-8">{users.length} Benutzer registriert</p>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="border-0 bg-card rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
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
              <UserActions
                userId={user.id}
                currentRole={user.role ?? null}
                isActive={user.is_active ?? true}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
