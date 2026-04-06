import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { TreePine, Menu, AlertTriangle } from 'lucide-react'
import UserMenuClient from './UserMenuClient'

async function getRole(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    return data?.role ?? null
  } catch {
    return null
  }
}

const navLinks = [
  { href: '/sofortanleitung', label: 'Sofortanleitung' },
]

export default async function Header() {
  const role = await getRole()
  const isJaeger = role === 'jaeger' || role === 'admin'
  const isAdmin = role === 'admin'

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TreePine className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground hidden sm:block">
              Wildmelder
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isJaeger && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/reviere" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Meine Reviere
                </Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10 px-4 shrink-0">
              <Link href="/melden">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Wildunfall melden
              </Link>
            </Button>

            {/* User dropdown — client-only to avoid hydration mismatch */}
            <UserMenuClient />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Menü öffnen</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isJaeger && (
                    <>
                      <Link href="/dashboard" className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border">
                        Dashboard
                      </Link>
                      <Link href="/reviere" className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border">
                        Meine Reviere
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border">
                      Admin-Panel
                    </Link>
                  )}
                  <Link href="/logout" className="text-base font-medium text-destructive hover:text-destructive/80 transition-colors py-2">
                    Abmelden
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
