export type CreateVariantBody = {
  possibleOptions: string[]
  label: string
}

export type VariantResponse = {
  id: number
  possibleOptions: string[]
  label: string
}
