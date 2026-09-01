import sharp from "sharp"

export const variantImageAdapter = {
  convertToWebp: async (originalBuffer: Buffer, size: number): Promise<Buffer> => {
    return await sharp(originalBuffer)
      .autoOrient()
      .resize({
        width: size,
        height: size,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ lossless: true, effort: 6 })
      .toBuffer()
  },
}
