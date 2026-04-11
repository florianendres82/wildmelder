'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, LayoutDashboard, Map, ShieldCheck } from 'lucide-react'

interface UserData {
  displayName: string | null
  email: string | null
  role: string | null
}

export default function UserMenu() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        setUserData(null)
        return
      }
      const user = session.user
      supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          setUserData({
            displayName: profile?.display_name ?? null,
            email: user.email ?? null,
            role: profile?.role ?? null,
          })
        })
    })

    return () => subscription.unsubscribe()
  }, [])

  // Not yet loaded — render placeholder to avoid layout shift
  if (userData === undefined) {
    return <div className="w-9 h-9" />
  }

  if (!userData) {
    return (
      <Button asChild variant="ghost" size="sm" className="hidden md:flex">
        <Link href="/login">Anmelden</Link>
      </Button>
    )
  }

  const isJaeger = userData.role === 'jaeger' || userData.role === 'admin'
  const isAdmin = userData.role === 'admin'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5 text-sm font-medium text-foreground truncate">
          {userData.displayName ?? userData.email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        {isJaeger && (
          <DropdownMenuItem asChild>
            <Link href="/reviere" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Meine Reviere
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Admin-Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive cursor-pointer"
          onSelect={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/')
            router.refresh()
          }}
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
