import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Client from "@/models/Client"

// ✅ GET - listar todos os clientes
export async function GET() {
  try {
    await connectToDatabase()
    const clients = await Client.find().sort({ createdAt: -1 })
    return NextResponse.json(clients)
  } catch (err) {
    console.error("❌ GET clients error:", err)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

// ✅ POST - criar novo cliente
export async function POST(req) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const client = await Client.create(body)
    return NextResponse.json(client, { status: 201 })
  } catch (err) {
    console.error("❌ POST client error:", err)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
