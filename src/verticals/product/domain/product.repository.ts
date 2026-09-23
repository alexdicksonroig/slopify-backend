import { type LocalizedText } from "./localized-text"

export type CreateProduct = {
  name: string
  description: LocalizedText | null
}

export type UpdateProduct = Partial<CreateProduct>
