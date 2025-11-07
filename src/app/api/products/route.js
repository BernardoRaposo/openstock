import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Product from "@/models/Product"
import Supplier from "@/models/Supplier"
import { productSchema } from "@/lib/validation/productSchema"
import { logAction } from "@/lib/logAction"

// ✅ GET - listar todos os produtos
export async function GET() {
  try {
    await connectToDatabase()

    const products = await Product.find().sort({ createdAt: -1 })

    // devolve SEMPRE array
    return NextResponse.json(products)
  } catch (err) {
    console.error("❌ Error fetching products:", err)
    // fallback — devolve array vazio em erro
    return NextResponse.json([], { status: 500 })
  }
}


// ✅ POST - criar um produto novo
export async function POST(req) {
  try {
    await connectToDatabase()
    const body = await req.json()

    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 })
    }

    const product = await Product.create(parsed.data)

    // 🧠 LOG: registar criação
    await logAction({
      action: "CREATE",
      productId: product._id,
      productName: product.name,
      details: `Product "${product.name}" created.`,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error("Error creating product:", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
