import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import StockMovement from "@/models/StockMovement"

export async function GET(req, context) {
  try {
    const { id } = await context.params // ✅ importante: await!

    await connectToDatabase()

    const movement = await StockMovement.findById(id)
      .populate("product", "name sku")
      .populate("client", "name email")
      .populate("transport", "_id type status driver")

    if (!movement) {
      return NextResponse.json({ error: "Movement not found" }, { status: 404 })
    }

    return NextResponse.json(movement)
  } catch (err) {
    console.error("❌ Error fetching movement:", err)
    return NextResponse.json({ error: "Failed to fetch movement" }, { status: 500 })
  }
}
