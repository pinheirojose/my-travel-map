import type { Place, PlaceDraft } from '@/types'

const NEARBY_DEGREES = 0.001

export function findDuplicatePlace(
  places: Place[],
  draft: Pick<PlaceDraft, 'name' | 'country' | 'latitude' | 'longitude'>,
  excludeId?: string,
): Place | undefined {
  const name = draft.name.trim().toLowerCase()
  const country = draft.country.trim().toLowerCase()

  return places.find((place) => {
    if (excludeId && place.id === excludeId) return false
    const sameName =
      place.name.trim().toLowerCase() === name &&
      place.country.trim().toLowerCase() === country &&
      name.length > 0
    const nearby =
      Math.abs(place.latitude - draft.latitude) < NEARBY_DEGREES &&
      Math.abs(place.longitude - draft.longitude) < NEARBY_DEGREES
    return sameName || nearby
  })
}
