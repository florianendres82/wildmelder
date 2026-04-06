import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  Phone,
  Hand,
  Camera,
  FileText,
  Car,
  Shield,
  Info,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sofortanleitung — Was tun nach einem Wildunfall? | Wildmelder',
  description:
    'Schritt-für-Schritt-Anleitung: Was müssen Sie nach einem Wildunfall tun? Rechtliche Pflichten, Sicherheit, Dokumentation. Auch offline verfügbar.',
}

const steps = [
  {
    number: 1,
    icon: Car,
    title: 'Fahrzeug sichern',
    description:
      'Halten Sie an einer sicheren Stelle an. Schalten Sie die Warnblinkanlage ein. Stellen Sie das Warndreieck ca. 100 m hinter dem Unfallort auf. Tragen Sie Ihre Warnweste.',
    warning: false,
  },
  {
    number: 2,
    icon: Shield,
    title: 'Eigene Sicherheit beachten',
    description:
      'Verlassen Sie nur dann das Fahrzeug, wenn es sicher ist. Stellen Sie sich nie zwischen Fahrbahn und Tier. Achten Sie auf den Verkehr — besonders bei Dunkelheit und auf Landstraßen.',
    warning: false,
  },
  {
    number: 3,
    icon: Hand,
    title: 'Tier nicht anfassen oder bewegen',
    description:
      'Berühren Sie das Tier nicht — auch nicht, um zu helfen. Viele Wildtiere tragen Krankheiten (z. B. Tollwut, Trichinen). Verletzte Tiere können um sich schlagen. Sichern Sie den Bereich ab.',
    warning: true,
    warningText: 'Tier NIEMALS anfassen — auch nicht, um es zu „retten"!',
  },
  {
    number: 4,
    icon: Phone,
    title: 'Polizei und Jäger benachrichtigen',
    description:
      'Rufen Sie sofort die Polizei (110) an — das ist gesetzlich vorgeschrieben (§ 34 StVO). Verwenden Sie Wildmelder, um den zuständigen Jäger automatisch zu finden und zu kontaktieren. Teilen Sie Ihren genauen Standort mit.',
    warning: false,
    callout: '110',
    calloutLabel: 'Polizei anrufen',
  },
  {
    number: 5,
    icon: Camera,
    title: 'Dokumentieren',
    description:
      'Fotografieren Sie: das Tier, den Unfallort, Schäden am Fahrzeug und eventuelle Blutspuren. Notieren Sie Zeit, Ort und Kennzeichen. Diese Fotos sind wichtig für Ihre Versicherung.',
    warning: false,
  },
  {
    number: 6,
    icon: FileText,
    title: 'Wildunfallbescheinigung anfordern',
    description:
      'Verlangen Sie von der Polizei eine schriftliche Wildunfallbescheinigung. Dieses Dokument benötigen Sie für die Versicherung. Ohne Bescheinigung können Leistungen verweigert werden.',
    warning: false,
  },
  {
    number: 7,
    icon: Info,
    title: 'Versicherung informieren',
    description:
      'Melden Sie den Unfall Ihrer Kfz-Versicherung. Wildschäden sind in der Regel durch die Teilkaskoversicherung abgedeckt — auch ohne eigenes Verschulden. Reichen Sie alle Fotos und die Wildunfallbescheinigung ein.',
    warning: false,
  },
]

export default function SofortanleitungPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <AlertTriangle className="w-4 h-4" />
          Notfallanleitung
        </div>
        <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Was tun nach einem Wildunfall?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Diese Anleitung ist auch offline verfügbar. Folgen Sie den Schritten
          in der angegebenen Reihenfolge — Ihre Sicherheit hat Priorität.
        </p>
      </div>

      {/* Emergency Banner */}
      <Card className="border-0 bg-secondary rounded-2xl mb-10">
        <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-secondary-foreground shrink-0" />
            <div>
              <p className="font-semibold text-secondary-foreground">Notruf Polizei</p>
              <p className="text-secondary-foreground/80 text-sm">
                Muss bei jedem Wildunfall gerufen werden
              </p>
            </div>
          </div>
          <a
            href="tel:110"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold text-xl rounded-xl px-6 py-3 hover:bg-accent/90 transition-colors"
          >
            <Phone className="w-5 h-5" />
            110
          </a>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.number} className="border-0 bg-card rounded-2xl">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Step number */}
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xl">
                    {step.number}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon className="w-5 h-5 text-primary shrink-0" />
                    <h2 className="font-heading font-semibold text-xl text-foreground">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    {step.description}
                  </p>
                  {step.warning && (
                    <div className="flex items-start gap-2 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-secondary">{step.warningText}</p>
                    </div>
                  )}
                  {step.callout && (
                    <a
                      href={`tel:${step.callout}`}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl px-5 py-2.5 hover:bg-primary/90 transition-colors mt-2"
                    >
                      <Phone className="w-4 h-4" />
                      {step.calloutLabel}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 bg-surface-container rounded-2xl p-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
          Jetzt Wildunfall melden
        </h2>
        <p className="text-muted-foreground mb-6">
          Nutzen Sie Wildmelder, um den zuständigen Jäger automatisch zu finden.
        </p>
        <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
          <Link href="/melden">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Jetzt melden
          </Link>
        </Button>
      </div>
    </div>
  )
}
