import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Log from "@/models/Log"

export async function GET() {
  try {
    await connectToDatabase()
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100)
    return NextResponse.json(logs)
  } catch (err) {
    console.error("Error fetching logs:", err)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectToDatabase()
    const data = await req.json()
    const log = await Log.create(data)
    return NextResponse.json(log)
  } catch (err) {
    console.error("Error creating log:", err)
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 })
  }
}
