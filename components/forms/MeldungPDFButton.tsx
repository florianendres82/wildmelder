'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'

interface MeldungPDFData {
  id: string
  createdAt: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  tierArt?: string | null
  tierTot?: boolean | null
  notes?: string | null
  reporterName?: string | null
  reporterPhone?: string | null
  reviername?: string | null
  jaegerName?: string | null
  jaegerPhone?: string | null
}

export default function MeldungPDFButton({ data }: { data: MeldungPDFData }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })

      const margin = 20
      const pageWidth = 210
      const contentWidth = pageWidth - margin * 2
      let y = margin

      // Header
      doc.setFillColor(21, 66, 18) // forest green
      doc.rect(0, 0, pageWidth, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('Wildunfall-Bescheinigung', margin, 16)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Wildunfall-Helfer — Automatisch erstellt', margin, 24)
      doc.text(`Meldungs-ID: ${data.id.slice(0, 8).toUpperCase()}`, margin, 30)

      y = 45
      doc.setTextColor(7, 30, 39) // deep navy

      function section(title: string) {
        doc.setFillColor(243, 250, 255)
        doc.rect(margin, y, contentWidth, 7, 'F')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(21, 66, 18)
        doc.text(title.toUpperCase(), margin + 2, y + 5)
        doc.setTextColor(7, 30, 39)
        y += 10
      }

      function row(label: string, value: string) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(label, margin, y)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(value, contentWidth - 55)
        doc.text(lines, margin + 55, y)
        y += lines.length * 5 + 2
      }

      // Zeitpunkt
      section('Meldung')
      row('Datum / Uhrzeit', new Date(data.createdAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }))

      y += 3
      section('Unfallort')
      if (data.address) row('Adresse', data.address)
      if (data.latitude && data.longitude) {
        row('Koordinaten', `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`)
      }
      if (data.latitude && data.longitude) {
        row('Google Maps', `https://www.google.com/maps?q=${data.latitude},${data.longitude}`)
      }

      if (data.tierArt) {
        y += 3
        section('Tier')
        row('Tierart', data.tierArt)
        if (data.tierTot !== null && data.tierTot !== undefined) {
          row('Zustand', data.tierTot ? 'Tot' : 'Verletzt')
        }
      }

      if (data.reviername || data.jaegerName || data.jaegerPhone) {
        y += 3
        section('Zuständiger Jäger')
        if (data.reviername) row('Revier', data.reviername)
        if (data.jaegerName) row('Name', data.jaegerName)
        if (data.jaegerPhone) row('Telefon', data.jaegerPhone)
      }

      if (data.reporterName || data.reporterPhone) {
        y += 3
        section('Melder')
        if (data.reporterName) row('Name', data.reporterName)
        if (data.reporterPhone) row('Telefon', data.reporterPhone)
      }

      if (data.notes) {
        y += 3
        section('Anmerkungen')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(data.notes, contentWidth)
        doc.text(lines, margin, y)
        y += lines.length * 5 + 2
      }

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        'Dieses Dokument wurde automatisch von Wildunfall-Helfer erstellt. Bitte für Versicherungs- und Polizeizwecke aufbewahren.',
        margin,
        285,
        { maxWidth: contentWidth }
      )

      const filename = `Wildunfall-${data.id.slice(0, 8).toUpperCase()}.pdf`
      doc.save(filename)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      PDF herunterladen
    </Button>
  )
}
