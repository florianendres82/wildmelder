import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Map, AlertTriangle, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin-Panel | Wildmelder',
}

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: revierCount },
    { count: meldungCount },
    { count: openCount },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('reviere').select('id', { count: 'exact', head: true }),
    supabase.from('wildmeldungen').select('id', { count: 'exact', head: true }),
    supabase.from('wildmeldungen').select('id', { count: 'exact', head: true }).eq('status', 'gemeldet'),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Admin-Panel</h1>
      <p className="text-muted-foreground mb-8">Systemübersicht und Verwaltung</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Benutzer', value: userCount ?? 0, icon: Users, href: '/admin/benutzer' },
          { label: 'Reviere', value: revierCount ?? 0, icon: Map, href: '/admin/reviere' },
          { label: 'Meldungen', value: meldungCount ?? 0, icon: AlertTriangle, href: '#' },
          { label: 'Offen', value: openCount ?? 0, icon: CheckCircle, href: '#' },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="border-0 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-colors">
              <CardContent className="p-5">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <p className="text-3xl font-heading font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/benutzer">
          <Card className="border-0 bg-card rounded-2xl hover:bg-surface-container transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Benutzerverwaltung</h2>
                <p className="text-sm text-muted-foreground">Rollen vergeben, Konten sperren</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reviere">
          <Card className="border-0 bg-card rounded-2xl hover:bg-surface-container transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Revierverwaltung</h2>
                <p className="text-sm text-muted-foreground">Alle eingetragenen Reviere</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
