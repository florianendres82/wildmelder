import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertTriangle,
  MapPin,
  Phone,
  FileText,
  BookOpen,
  Map,
  Shield,
  ChevronRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-8 lg:pr-16 pointer-events-none select-none">
          <Image
            src="/logo.png"
            alt=""
            width={442}
            height={584}
            className="w-48 sm:w-64 lg:w-80 h-auto opacity-10"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <AlertTriangle className="w-4 h-4" />
              Wildunfall — schnell handeln
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Wildunfall?{' '}
              <span className="text-accent">Jetzt sofort</span>{' '}
              den richtigen Jäger erreichen.
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl">
              GPS-Standort automatisch ermitteln, zuständigen Jäger finden und
              direkt kontaktieren — in unter einer Minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground hover:text-white transition-colors"
              >
                <Link href="/melden">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Jetzt Wildunfall melden
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-primary-foreground text-primary border-transparent hover:bg-primary-foreground/90 hover:text-accent transition-colors"
              >
                <Link href="/sofortanleitung">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Sofortanleitung lesen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-3">
              So einfach funktioniert es
            </h2>
            <p className="text-muted-foreground text-lg">Drei Schritte — fertig</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                icon: MapPin,
                title: 'Standort bestimmen',
                desc: 'GPS-Standort per Knopfdruck oder manuell auf der Karte setzen — in Sekunden erledigt.',
              },
              {
                step: '2',
                icon: Phone,
                title: 'Jäger sofort ermittelt',
                desc: 'Der zuständige Jäger für genau dieses Revier wird automatisch gefunden und seine Nummer direkt angezeigt.',
              },
              {
                step: '3',
                icon: FileText,
                title: 'Optional dokumentieren',
                desc: 'Tierart, Fotos und Notizen für die Versicherung ergänzen — oder einfach überspringen.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <Card key={step} className="border-0 bg-surface-container rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-lg">
                      {step}
                    </div>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
              <Link href="/melden">
                Wildunfall melden
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sofortanleitung preview */}
      <section className="py-16 bg-surface-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                Wichtig zu wissen
              </div>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Was tun nach einem Wildunfall?
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Klare Schritt-für-Schritt-Anleitung — auch offline verfügbar.
                Ihre rechtlichen Pflichten, einfach erklärt.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Warnblinkanlage einschalten & absichern',
                  'Tier nicht berühren oder bewegen',
                  'Polizei (110) und Jäger benachrichtigen',
                  'Fotos & Standort dokumentieren',
                  'Wildunfallbescheinigung anfordern',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="lg" className="h-12 px-6">
                <Link href="/sofortanleitung">
                  Vollständige Anleitung lesen
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="bg-primary rounded-3xl p-8 text-primary-foreground">
              <div className="text-6xl font-heading font-bold text-accent mb-2">110</div>
              <p className="text-xl font-semibold mb-1">Polizei-Notruf</p>
              <p className="text-primary-foreground/70 mb-6">
                Bei einem Wildunfall immer die Polizei informieren — das ist gesetzlich vorgeschrieben.
              </p>
              <a
                href="tel:110"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold rounded-xl px-6 py-3 hover:bg-accent/90 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Jetzt anrufen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Jäger CTA */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 bg-primary-container rounded-3xl overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-heading text-3xl font-bold text-on-primary-container mb-4">
                    Sind Sie Jäger?
                  </h2>
                  <p className="text-on-primary-container/80 text-lg mb-6">
                    Zeichnen Sie Ihr Revier auf der Karte ein und hinterlegen Sie Ihre
                    Telefonnummer. So werden Sie automatisch bei Wildunfällen in Ihrem
                    Revier benachrichtigt.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Link href="/signup">
                        <Map className="w-5 h-5 mr-2" />
                        Revier einzeichnen
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="lg"
                      className="h-12 px-6 text-on-primary-container hover:bg-on-primary-container/10"
                    >
                      <Link href="/login">Bereits registriert? Anmelden</Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:grid grid-cols-2 gap-3">
                  {[
                    { label: 'Reviere verwalten', icon: Map },
                    { label: 'Meldungen empfangen', icon: AlertTriangle },
                    { label: 'Direkt erreichbar', icon: Phone },
                    { label: 'Sicher & geschützt', icon: Shield },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="bg-primary/20 rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
                    >
                      <Icon className="w-6 h-6 text-on-primary-container" />
                      <span className="text-sm font-medium text-on-primary-container">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
