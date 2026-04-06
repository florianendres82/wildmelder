'use client'

import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Camera, X } from 'lucide-react'

interface PhotoStepProps {
  photoFiles: File[]
  notes: string
  reporterName: string
  reporterPhone: string
  onPhotosChange: (files: File[]) => void
  onNotesChange: (value: string) => void
  onReporterNameChange: (value: string) => void
  onReporterPhoneChange: (value: string) => void
}

export default function PhotoStep({
  photoFiles,
  notes,
  reporterName,
  reporterPhone,
  onPhotosChange,
  onNotesChange,
  onReporterNameChange,
  onReporterPhoneChange,
}: PhotoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    onPhotosChange([...photoFiles, ...files])
    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    onPhotosChange(photoFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Photos */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Fotos aufnehmen{' '}
          <span className="text-muted-foreground font-normal text-sm">(optional)</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Fotos helfen bei der Versicherungsabwicklung und Dokumentation.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-14 border-dashed text-muted-foreground hover:text-foreground"
        >
          <Camera className="w-5 h-5 mr-2" />
          Foto aufnehmen oder hochladen
        </Button>
        {photoFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {photoFiles.map((file, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-base font-semibold">
          Anmerkungen{' '}
          <span className="text-muted-foreground font-normal text-sm">(optional)</span>
        </Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Weitere Informationen zum Unfall…"
          rows={3}
          className="mt-2 w-full rounded-xl border border-input bg-surface-container-high px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Reporter contact (optional) */}
      <div className="bg-surface-container rounded-2xl p-4 space-y-3">
        <p className="font-semibold text-foreground">
          Ihre Kontaktdaten{' '}
          <span className="text-muted-foreground font-normal text-sm">(optional)</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Damit der Jäger Sie bei Rückfragen kontaktieren kann.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="reporterName" className="text-sm">Name</Label>
            <Input
              id="reporterName"
              type="text"
              placeholder="Ihr Name"
              value={reporterName}
              onChange={(e) => onReporterNameChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="reporterPhone" className="text-sm">Telefon</Label>
            <Input
              id="reporterPhone"
              type="tel"
              placeholder="+49 …"
              value={reporterPhone}
              onChange={(e) => onReporterPhoneChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
