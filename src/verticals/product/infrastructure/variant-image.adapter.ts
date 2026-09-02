import sharp from "sharp"

export const variantImageAdapter = {
  convertToWebp: async (
    originalBuffer: Buffer,
    width: number,
    height: number = width,
  ): Promise<Buffer> => {
    return await sharp(originalBuffer)
      .autoOrient()
      .resize({
        width,
        height,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ lossless: true, effort: 6 })
      .toBuffer()
  },
}
