'use client'

import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface MobileMenuProps {
  isJaeger: boolean
  isAdmin: boolean
  isLoggedIn: boolean
}

export default function MobileMenu({ isJaeger, isAdmin, isLoggedIn }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <nav className="flex flex-col gap-4 mt-8">
          <Link href="/sofortanleitung" className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border">
            Sofortanleitung
          </Link>
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
          {isLoggedIn ? (
            <Link href="/logout" className="text-base font-medium text-destructive hover:text-destructive/80 transition-colors py-2">
              Abmelden
            </Link>
          ) : (
            <Link href="/login" className="text-base font-medium text-foreground hover:text-primary transition-colors py-2">
              Anmelden
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
