'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'

export default function ZoomDisplay() {
  const map = useMap()
  const [zoom, setZoom] = useState(() => Math.round(map.getZoom()))

  useEffect(() => {
    const handler = () => setZoom(Math.round(map.getZoom()))
    map.on('zoomend', handler)
    return () => { map.off('zoomend', handler) }
  }, [map])

  return createPortal(
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#071E27',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      Zoom {zoom}
    </div>,
    map.getContainer()
  )
}
