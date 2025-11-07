import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Product from "@/models/Product"

export async function GET() {
  try {
    await connectToDatabase()

    // ⚙️ Agrupa produtos por categoria e calcula margem média
    const results = await Product.aggregate([
      {
        $match: {
          price: { $gt: 0 },
          cost: { $gte: 0 },
          category: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$category",
          avgMargin: {
            $avg: {
              $multiply: [
                { $divide: [{ $subtract: ["$price", "$cost"] }, "$price"] },
                100,
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          margin: { $round: ["$avgMargin", 1] },
          count: 1,
        },
      },
      { $sort: { margin: -1 } },
    ])

    return NextResponse.json(results)
  } catch (err) {
    console.error("❌ Error in GET /api/analytics/margins:", err)
    return NextResponse.json({ error: "Failed to calculate margins" }, { status: 500 })
  }
}
