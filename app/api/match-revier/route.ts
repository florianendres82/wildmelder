import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import type { GeoJSON } from 'geojson'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { latitude, longitude } = body as { latitude: number; longitude: number }

  if (!latitude || !longitude) {
    return NextResponse.json({ error: 'Koordinaten fehlen' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: reviere, error } = await supabase
    .from('reviere')
    .select('id, name, polygon, phone_numbers, jaeger_id')

  if (error) {
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
  }

  const pt = point([longitude, latitude])
  const matched = reviere?.find((revier) => {
    try {
      return booleanPointInPolygon(pt, revier.polygon as GeoJSON.Polygon)
    } catch {
      return false
    }
  })

  if (!matched) {
    return NextResponse.json({ revier: null })
  }

  // Fetch hunter profile via admin client (bypasses RLS — guest has no session)
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', matched.jaeger_id)
    .single()

  return NextResponse.json({
    revier: {
      id: matched.id,
      name: matched.name,
      phone_numbers: matched.phone_numbers,
      jaeger_name: profile?.display_name ?? 'Unbekannt',
    },
  })
}
