export function parseVariantFilters(
  query: Record<string, string>,
): Array<{ optionId: number; valueId: number }> {
  return Object.entries(query).map(([optionId, valueId]) => ({
    optionId: Number(optionId),
    valueId: Number(valueId),
  }))
}
