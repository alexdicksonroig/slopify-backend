import sharp from "sharp"

export const variantImageAdapter = {
  convertToWebp: async (originalBuffer: Buffer, height: number): Promise<Buffer> => {
    return await sharp(originalBuffer)
      .autoOrient()
      .resize({ height })
      .webp({ lossless: true, effort: 6 })
      .toBuffer()
  },
}
