import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import StockMovement from "@/models/StockMovement"

export async function GET() {
  try {
    await connectToDatabase()

    // 📦 Buscar todos os movimentos ordenados por data
    const movements = await StockMovement.find().sort({ createdAt: 1 })

    // Se ainda não houver movimentos
    if (!movements.length) {
      return NextResponse.json({ totalValue: 0, history: [] })
    }

    let cumulativeValue = 0
    const dailyValues = {}

    // 🧮 Iterar todos os movimentos e calcular o valor acumulado diário
    for (const m of movements) {
      const day = m.createdAt.toISOString().split("T")[0]

      // Valor do movimento = preço no momento * quantidade
      const valueChange = (m.priceAtMovement || 0) * (m.quantity || 0)

      if (m.type === "entry") cumulativeValue += valueChange
      else if (m.type === "exit") cumulativeValue -= valueChange

      // Armazenar o valor total acumulado até esse dia
      dailyValues[day] = cumulativeValue
    }

    // Converter em array formatado para gráfico
    const history = Object.entries(dailyValues).map(([day, value]) => ({
      day,
      value: Math.max(0, Math.round(value)), // nunca negativo
    }))

    // Valor total atual = último valor acumulado
    const totalValue = history.length ? history[history.length - 1].value : 0

    return NextResponse.json({ totalValue, history })
  } catch (err) {
    console.error("❌ Error fetching inventory value:", err)
    return NextResponse.json({ error: "Failed to fetch inventory value" }, { status: 500 })
  }
}
