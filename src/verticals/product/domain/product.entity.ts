import { type LocalizedText } from "./localized-text"

export class Product {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly description: LocalizedText | null,
  ) {}
}
