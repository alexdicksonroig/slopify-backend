import sharp from "sharp"

export const variantImageAdapter = {
  convertToWebp: async (originalBuffer: Buffer): Promise<Buffer> => {
    return await sharp(originalBuffer).autoOrient().webp({ lossless: true, effort: 6 }).toBuffer()
  },
}
