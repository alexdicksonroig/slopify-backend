import sharp from "sharp"

class VariantImageAdapter {
  async convertToWebp(originalBuffer: Buffer, height: number): Promise<Buffer> {
    return await sharp(originalBuffer)
      .autoOrient()
      .resize({ height })
      .webp({ lossless: true, effort: 6 })
      .toBuffer()
  }
}

export const variantImageAdapter = new VariantImageAdapter()
