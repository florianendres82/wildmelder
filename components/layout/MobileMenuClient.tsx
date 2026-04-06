'use client'

import dynamic from 'next/dynamic'

const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false, loading: () => <div className="w-9 h-9 md:hidden" /> })

interface Props { isJaeger: boolean; isAdmin: boolean; isLoggedIn: boolean }

export default function MobileMenuClient(props: Props) {
  return <MobileMenu {...props} />
}
