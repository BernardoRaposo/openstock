import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Product from "@/models/Product"
import Client from "@/models/Client"
import StockMovement from "@/models/StockMovement"
import Transport from "@/models/Transport"
import { logAction } from "@/lib/logAction"

export async function POST(req) {
  try {
    await connectToDatabase()
    const {
      type,
      productId,
      quantity,
      location,
      responsible,
      transportType,
      description,
      clientId,
    } = await req.json()

    const product = await Product.findById(productId)
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    // Atualiza stock
    let newQuantity = type === "entry" ? product.quantity + quantity : product.quantity - quantity
    if (newQuantity < 0) newQuantity = 0
    product.quantity = newQuantity
    await product.save()

    // Determina cliente/localização
    let finalLocation = location || ""
    let client = null
    if (type === "exit" && clientId) {
      client = await Client.findById(clientId)
      if (client) finalLocation = client.name
    }

    // Cria movimento
    let movement = await StockMovement.create({
      type,
      product: productId,
      quantity,
      location: finalLocation,
      responsible,
      transportType,
      description,
      currentStock: newQuantity,
      client: client?._id || null,
    })

    // 🚚 Cria transporte automaticamente, se aplicável
    if (["supplier", "client", "internal"].includes(transportType)) {
      const transportData = {
        type:
          transportType === "client"
            ? type === "exit"
              ? "delivery"
              : "pickup"
            : "internal",
        status: "pending",
        driver: responsible || "N/A",
        vehicle: "",
        relatedMovement: movement._id,
        items: [{ product: product._id, quantity }],
        notes: description || "",
      }

      // Definir origens/destinos
      if (transportType === "client" && client) {
        if (type === "exit") {
          transportData.originLocation = location
          transportData.destinationClient = client._id
        } else {
          transportData.originClient = client._id
          transportData.destinationLocation = location
        }
      } else if (transportType === "internal") {
        transportData.originLocation = location
        transportData.destinationLocation = "Armazém Secundário"
      }

      const transport = await Transport.create(transportData)

      // 🔗 Liga movimento ao transporte
      movement.transport = transport._id
      await movement.save()
    }

    // Popula antes de devolver
    movement = await movement.populate([
      { path: "product", select: "name sku" },
      { path: "client", select: "name email" },
      { path: "transport", select: "_id type status driver" },
    ])

    // Log
    await logAction({
      action: type === "entry" ? "STOCK_ENTRY" : "STOCK_EXIT",
      productId: product._id,
      productName: product.name,
      details: `${type === "entry" ? "Added" : "Removed"} ${quantity} units (${transportType}) — ${responsible}`,
    })

    return NextResponse.json(movement, { status: 201 })
  } catch (err) {
    console.error("❌ Error creating movement:", err)
    return NextResponse.json({ error: "Failed to register stock movement" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectToDatabase()
    const movements = await StockMovement.find()
      .populate("product", "name sku")
      .populate("client", "name email")
      .populate("transport", "_id type status driver")
      .sort({ createdAt: -1 })

    return NextResponse.json(movements)
  } catch (err) {
    console.error("❌ Error fetching movements:", err)
    return NextResponse.json({ error: "Failed to fetch movements" }, { status: 500 })
  }
}
