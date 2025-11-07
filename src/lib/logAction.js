import Log from "@/models/Log"
import { connectToDatabase } from "@/lib/db"

export async function logAction({ action, productId, productName, details }) {
  try {
    await connectToDatabase()
    await Log.create({
      action,
      productId,
      productName,
      details,
    })
  } catch (err) {
    console.error("Error logging action:", err)
  }
}
