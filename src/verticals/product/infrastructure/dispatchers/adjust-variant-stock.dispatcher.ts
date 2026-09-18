import { type DatabaseTransaction } from "@database"
import { variantRepository } from "../persistence/variants/variant.repository"

export const adjustVariantStockDispatcher = {
  decrement: async (
    variantId: number,
    quantity: number,
    transaction: DatabaseTransaction,
  ): Promise<void> => {
    await variantRepository.decrementStock(variantId, quantity, transaction)
  },
}
