import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Supplier from "@/models/Supplier"

// ✅ GET - listar fornecedores
export async function GET() {
  await connectToDatabase()
  const suppliers = await Supplier.find().sort({ createdAt: -1 })
  return NextResponse.json(suppliers)
}

// ✅ POST - criar fornecedor
export async function POST(req) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const supplier = await Supplier.create(body)
    return NextResponse.json(supplier, { status: 201 })
  } catch (err) {
    console.error("Error creating supplier:", err)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
