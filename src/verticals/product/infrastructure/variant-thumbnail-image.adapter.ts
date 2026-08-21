import sharp from "sharp"

const DEFAULT_BACKGROUND_COLOR = "#ffffff"
const DEFAULT_QUALITY = 80

export const variantThumbnailImageAdapter = {
  convertToWebp: async (originalBuffer: Buffer): Promise<Buffer> => {
    const metadata = await sharp(originalBuffer).metadata()
    const size = Math.max(metadata.autoOrient.width, metadata.autoOrient.height)

    return await sharp(originalBuffer)
      .autoOrient()
      .resize({
        width: size,
        height: size,
        fit: "contain",
        background: DEFAULT_BACKGROUND_COLOR,
      })
      .flatten({ background: DEFAULT_BACKGROUND_COLOR })
      .webp({ quality: DEFAULT_QUALITY })
      .toBuffer()
  },
}
