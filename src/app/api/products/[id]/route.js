import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Product from "@/models/Product"
import { logAction } from "@/lib/logAction"

// ✅ GET - obter produto individual
export async function GET(req, context) {
  const { id } = await context.params

  try {
    await connectToDatabase()
    const product = await Product.findById(id)
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(product)
  } catch (err) {
    console.error("❌ GET product error:", err)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// ✅ DELETE - apagar produto
export async function DELETE(req, context) {
  const { id } = await context.params

  try {
    await connectToDatabase()
    const deleted = await Product.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // 🧠 LOG: registar remoção
    await logAction({
      action: "DELETE",
      productId: deleted._id,
      productName: deleted.name,
      details: `Product "${deleted.name}" was deleted.`,
    })

    return NextResponse.json({ message: "Deleted successfully" })
  } catch (err) {
    console.error("❌ DELETE product error:", err)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}

// ✅ PUT - atualizar produto
export async function PUT(req, context) {
  const { id } = await context.params

  try {
    const body = await req.json()
    await connectToDatabase()
    const updated = await Product.findByIdAndUpdate(id, body, { new: true })
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // 🧠 LOG: registar atualização
    await logAction({
      action: "UPDATE",
      productId: updated._id,
      productName: updated.name,
      details: `Product "${updated.name}" was updated.`,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("❌ PUT product error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
