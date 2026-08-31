import sharp from "sharp"

const THUMBNAIL_SIZE = 250
const DEFAULT_QUALITY = 95

export const variantThumbnailImageAdapter = {
  convertToWebp: async (originalBuffer: Buffer): Promise<Buffer> => {
    return await sharp(originalBuffer)
      .autoOrient()
      .resize({
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: DEFAULT_QUALITY })
      .toBuffer()
  },
}
