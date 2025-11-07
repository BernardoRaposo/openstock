import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Transport from "@/models/Transport"
import Client from "@/models/Client"
import Product from "@/models/Product"
import StockMovement from "@/models/StockMovement"

export async function GET(req, context) {
  const { id } = await context.params
  try {
    await connectToDatabase()

    const transport = await Transport.findById(id)
      .populate("originClient", "name email phone address")
      .populate("destinationClient", "name email phone address")
      .populate("items.product", "name sku")
      .populate({
        path: "relatedMovement",
        populate: [
          { path: "product", select: "name sku" },
          { path: "client", select: "name email" },
        ],
      })

    if (!transport)
      return NextResponse.json({ error: "Transport not found" }, { status: 404 })

    return NextResponse.json(transport)
  } catch (err) {
    console.error("❌ Error fetching transport:", err)
    return NextResponse.json({ error: "Failed to fetch transport" }, { status: 500 })
  }
}

export async function PUT(req, context) {
  const { id } = await context.params

  try {
    await connectToDatabase()
    const body = await req.json()

    const updated = await Transport.findByIdAndUpdate(id, body, { new: true })
      .populate("destinationClient", "name email")
      .populate("items.product", "name sku")
      .populate("relatedMovement", "type quantity")

    if (!updated)
      return NextResponse.json({ error: "Transport not found" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("❌ PUT transport error:", err)
    return NextResponse.json({ error: "Failed to update transport" }, { status: 500 })
  }
}

export async function DELETE(req, context) {
  const { id } = await context.params

  try {
    await connectToDatabase()
    const deleted = await Transport.findByIdAndDelete(id)

    if (!deleted)
      return NextResponse.json({ error: "Transport not found" }, { status: 404 })

    return NextResponse.json({ message: "Transport deleted successfully" })
  } catch (err) {
    console.error("❌ DELETE transport error:", err)
    return NextResponse.json({ error: "Failed to delete transport" }, { status: 500 })
  }
}
