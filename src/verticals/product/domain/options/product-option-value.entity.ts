import { type LocalizedText } from "../localized-text"

export class ProductOptionValue {
  constructor(
    readonly id: number,
    readonly label: LocalizedText,
  ) {}
}
