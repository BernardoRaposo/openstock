import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Supplier from "@/models/Supplier"

export async function PUT(req, { params }) {
  const { id } = await params
  await connectToDatabase()
  const body = await req.json()
  const updated = await Supplier.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const { id } = await params
  await connectToDatabase()
  await Supplier.findByIdAndDelete(id)
  return NextResponse.json({ message: "Deleted successfully" })
}
