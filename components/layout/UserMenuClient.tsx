'use client'

import dynamic from 'next/dynamic'

const UserMenu = dynamic(() => import('./UserMenu'), { ssr: false, loading: () => <div className="w-9 h-9" /> })

export default function UserMenuClient() {
  return <UserMenu />
}
