'use client'

import { cn } from '@/lib/utils'

const TIERE = [
  { value: 'Reh', emoji: '🦌', label: 'Reh' },
  { value: 'Wildschwein', emoji: '🐗', label: 'Wildschwein' },
  { value: 'Fuchs', emoji: '🦊', label: 'Fuchs' },
  { value: 'Hase', emoji: '🐇', label: 'Hase' },
  { value: 'Dachs', emoji: '🦡', label: 'Dachs' },
  { value: 'Hirsch', emoji: '🦌', label: 'Hirsch / Rotwild' },
  { value: 'Vogel', emoji: '🐦', label: 'Vogel' },
  { value: 'Sonstiges', emoji: '❓', label: 'Sonstiges' },
]

interface TierStepProps {
  tierArt: string
  tierTot: boolean
  onTierArtChange: (value: string) => void
  onTierTotChange: (value: boolean) => void
}

export default function TierStep({
  tierArt,
  tierTot,
  onTierArtChange,
  onTierTotChange,
}: TierStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Welches Tier war beteiligt?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIERE.map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => onTierArtChange(tier.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition-all text-center',
                tierArt === tier.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
              )}
            >
              <span className="text-3xl">{tier.emoji}</span>
              <span className="text-sm font-medium leading-tight">{tier.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Zustand des Tieres</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onTierTotChange(true)}
            className={cn(
              'rounded-2xl p-4 border-2 transition-all text-center',
              tierTot
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-foreground hover:border-primary/50'
            )}
          >
            <div className="text-2xl mb-1">💀</div>
            <div className="font-medium text-sm">Tier ist tot</div>
          </button>
          <button
            type="button"
            onClick={() => onTierTotChange(false)}
            className={cn(
              'rounded-2xl p-4 border-2 transition-all text-center',
              !tierTot
                ? 'border-secondary bg-secondary/10 text-secondary'
                : 'border-border bg-card text-foreground hover:border-secondary/50'
            )}
          >
            <div className="text-2xl mb-1">🤕</div>
            <div className="font-medium text-sm">Tier ist verletzt</div>
          </button>
        </div>
        {!tierTot && (
          <div className="mt-3 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
            <p className="text-sm text-secondary font-medium">
              Verletztes Tier: Bitte nicht anfassen! Bereich absichern und auf den Jäger warten.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
