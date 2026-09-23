export function parseVariantFilters(
  query: Record<string, string>,
): Array<{ optionId: string; valueId: number }> {
  return Object.entries(query).map(([optionId, valueId]) => ({
    optionId,
    valueId: Number(valueId),
  }))
}
