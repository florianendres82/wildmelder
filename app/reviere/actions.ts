'use server'

import { createClient } from '@/lib/supabase/server'
import intersect from '@turf/intersect'
import area from '@turf/area'
import { featureCollection, polygon as turfPolygon } from '@turf/helpers'
import type { GeoJSON } from 'geojson'

const OVERLAP_THRESHOLD = 0.20 // 20%

export async function checkRevierOverlap(
  newPolygon: GeoJSON.Polygon,
  excludeId?: string,
): Promise<{ conflict: true; name: string } | { conflict: false }> {
  const supabase = await createClient()

  let query = supabase.from('reviere').select('id, name, polygon')
  if (excludeId) query = query.neq('id', excludeId)

  const { data: reviere } = await query

  if (!reviere?.length) return { conflict: false }

  const newFeat = turfPolygon(newPolygon.coordinates)
  const newArea = area(newFeat)

  for (const revier of reviere) {
    const existingFeat = turfPolygon((revier.polygon as GeoJSON.Polygon).coordinates)
    const existingArea = area(existingFeat)

    let intersection: ReturnType<typeof intersect>
    try {
      intersection = intersect(featureCollection([newFeat, existingFeat]))
    } catch {
      continue
    }

    if (!intersection) continue

    const overlapArea = area(intersection)
    const overlapRatioNew = overlapArea / newArea
    const overlapRatioExisting = overlapArea / existingArea

    if (overlapRatioNew > OVERLAP_THRESHOLD || overlapRatioExisting > OVERLAP_THRESHOLD) {
      return { conflict: true, name: revier.name }
    }
  }

  return { conflict: false }
}
