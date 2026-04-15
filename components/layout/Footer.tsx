import Link from 'next/link'
import { TreePine, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <TreePine className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-primary-foreground">Wildunfall-Helfer</span>
          </div>

          {/* Emergency */}
          <div className="flex items-center gap-3 bg-accent/20 rounded-xl px-4 py-2.5">
            <Phone className="w-4 h-4 text-accent shrink-0" />
            <div>
              <p className="text-xs text-primary-foreground/70">Notruf Polizei</p>
              <a
                href="tel:110"
                className="text-lg font-bold text-accent hover:text-accent/90 transition-colors"
              >
                110
              </a>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/70">
            <Link href="/sofortanleitung" className="hover:text-primary-foreground transition-colors">
              Sofortanleitung
            </Link>
            <Link href="/melden" className="hover:text-primary-foreground transition-colors">
              Wildunfall melden
            </Link>
            <Link href="/login" className="hover:text-primary-foreground transition-colors">
              Jäger-Login
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-xs text-primary-foreground/50 text-center">
          © {new Date().getFullYear()} Wildunfall-Helfer — Schnelle Hilfe bei Wildunfällen
        </div>
      </div>
    </footer>
  )
}
