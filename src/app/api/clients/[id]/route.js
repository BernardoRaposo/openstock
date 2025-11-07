import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Client from "@/models/Client"
import StockMovement from "@/models/StockMovement"
import Product from "@/models/Product"

// ✅ GET - cliente individual (com estatísticas)
export async function GET(req, context) {
  const { id } = await context.params

  try {
    await connectToDatabase()

    const client = await Client.findById(id)
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // 🔍 Buscar todos os movimentos relacionados a este cliente
    const movements = await StockMovement.find({ client: id })
      .populate("product", "name sku price")
      .sort({ createdAt: -1 })

    // 📊 Estatísticas básicas
    const totalMovements = movements.length
    const totalQuantity = movements.reduce((sum, m) => sum + (m.quantity || 0), 0)
    const lastPurchaseAt = movements[0]?.createdAt || null

    // 💰 Total Value (soma de quantity * priceAtMovement)
    const totalValue = movements.reduce(
      (sum, m) => sum + (m.priceAtMovement || 0) * (m.quantity || 0),
      0
    )

    // 🥇 Top Products
    const productStats = {}
    for (const m of movements) {
      if (!m.product) continue
      const name = m.product.name || "Unknown"
      productStats[name] = (productStats[name] || 0) + m.quantity
    }

    const topProducts = Object.entries(productStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, qty]) => ({ name, qty }))

    return NextResponse.json({
      client,
      stats: {
        totalMovements,
        totalQuantity,
        totalValue,
        lastPurchaseAt,
        topProducts,
      },
      movements,
    })
  } catch (err) {
    console.error("❌ GET client error:", err)
    return NextResponse.json({ error: "Failed to fetch client details" }, { status: 500 })
  }
}

// ✅ PUT - atualizar cliente
export async function PUT(req, context) {
  const { id } = await context.params
  try {
    const body = await req.json()
    await connectToDatabase()
    const updated = await Client.findByIdAndUpdate(id, body, { new: true })
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error("❌ PUT client error:", err)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

// ✅ DELETE - apagar cliente
export async function DELETE(req, context) {
  const { id } = await context.params
  try {
    await connectToDatabase()
    const deleted = await Client.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ message: "Deleted successfully" })
  } catch (err) {
    console.error("❌ DELETE client error:", err)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
