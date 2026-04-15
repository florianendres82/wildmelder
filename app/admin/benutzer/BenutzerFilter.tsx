'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Map } from 'lucide-react'

export default function BenutzerFilter({ active }: { active: boolean }) {
  const router = useRouter()
  const pathname = usePathname()

  function toggle() {
    if (active) {
      router.replace(pathname)
    } else {
      router.replace(`${pathname}?ohneRevier=1`)
    }
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2 transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/70'
      }`}
    >
      <Map className="w-4 h-4" />
      Jäger ohne Revier
    </button>
  )
}
