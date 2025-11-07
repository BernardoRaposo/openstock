import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Transport from "@/models/Transport"
import StockMovement from "@/models/StockMovement" // ⚙️ Importa o modelo

export async function GET() {
  try {
    await connectToDatabase()
    const transports = await Transport.find()
      .populate("originClient", "name email address")
      .populate("destinationClient", "name email address")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 })

    return NextResponse.json(transports)
  } catch (err) {
    console.error("❌ Error fetching transports:", err)
    return NextResponse.json({ error: "Failed to fetch transports" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectToDatabase()
    const data = await req.json()

    // ✅ Sanitização: remove campos vazios (por exemplo, null ou "")
    Object.keys(data).forEach(
      (key) => (data[key] === "" || data[key] === null) && delete data[key]
    )

    // ✅ Criação do transporte
    const transport = await Transport.create(data)

    // ⚙️ Se o transporte estiver relacionado com um movimento de stock, faz o link
    if (data.relatedMovement) {
      await StockMovement.findByIdAndUpdate(data.relatedMovement, {
        transport: transport._id,
      })
    }

    // ✅ Popula dados para retorno completo
    const populated = await transport.populate([
      { path: "originClient", select: "name email" },
      { path: "destinationClient", select: "name email" },
      { path: "items.product", select: "name sku" },
    ])

    return NextResponse.json(populated, { status: 201 })
  } catch (err) {
    console.error("❌ Error creating transport:", err)
    return NextResponse.json({ error: "Failed to create transport" }, { status: 500 })
  }
}
