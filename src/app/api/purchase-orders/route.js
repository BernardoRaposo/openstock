import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import PurchaseOrder from "@/models/PurchaseOrder"
import Product from "@/models/Product"
import StockMovement from "@/models/StockMovement"

export async function GET() {
  await connectToDatabase()
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 })
    return NextResponse.json(orders)
  } catch (err) {
    console.error("Error fetching purchase orders:", err)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(req) {
  await connectToDatabase()
  try {
    const body = await req.json()
    const { supplier, items, expectedDate } = body

    const processedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product)
        if (!product) throw new Error(`Product not found: ${item.product}`)

        // Usa o custo do produto se não vier um novo
        const unitCost = item.unitCost ?? product.cost ?? 0
        return { product: product._id, quantity: item.quantity, unitCost }
      })
    )

    const total = processedItems.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)

    const newOrder = await PurchaseOrder.create({
      supplier,
      items: processedItems,
      expectedDate,
      total,
    })

    return NextResponse.json(newOrder)
  } catch (err) {
    console.error("Error creating purchase order:", err)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function PATCH(req) {
  await connectToDatabase()
  try {
    const { id, status } = await req.json()
    const order = await PurchaseOrder.findById(id).populate("items.product")

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    order.status = status

    // Se a ordem foi marcada como "received"
    if (status === "received") {
      for (const item of order.items) {
        const product = await Product.findById(item.product._id)
        if (!product) continue

        // Atualiza o stock
        product.quantity += item.quantity

        // Atualiza o custo (média ponderada)
        const totalOld = product.quantity * product.cost
        const totalNew = item.quantity * item.unitCost
        const newCost =
          product.quantity > 0
            ? (totalOld + totalNew) / (product.quantity + item.quantity)
            : item.unitCost

        product.cost = newCost
        await product.save()

        // Regista o movimento de stock
        await StockMovement.create({
          type: "entry",
          product: product._id,
          quantity: item.quantity,
          location: "warehouse",
          responsible: "system",
          transportType: "supplier",
          description: `Purchase order ${order._id} received`,
          currentStock: product.quantity,
        })
      }
    }

    await order.save()
    return NextResponse.json(order)
  } catch (err) {
    console.error("Error updating purchase order:", err)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
