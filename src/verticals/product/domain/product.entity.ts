export class Product {
  thumbnail: string | null

  constructor(
    readonly id: number,
    readonly name: string,
    readonly description: string | null,
    readonly priceInCents: number,
    thumbnailReference: string | null,
  ) {
    this.thumbnail = thumbnailReference
  }

  replaceThumbnail(reference: string): void {
    this.thumbnail = reference
  }

  removeThumbnail(): void {
    this.thumbnail = null
  }
}
