import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import StockMovement from "@/models/StockMovement"

export async function GET() {
  try {
    await connectToDatabase()

    const pipeline = [
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          entries: {
            $sum: {
              $cond: [{ $eq: ["$type", "entry"] }, "$quantity", 0],
            },
          },
          exits: {
            $sum: {
              $cond: [{ $eq: ["$type", "exit"] }, "$quantity", 0],
            },
          },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          day: "$_id",
          entries: 1,
          exits: 1,
        },
      },
    ]

    const results = await StockMovement.aggregate(pipeline)
    return NextResponse.json(results)
  } catch (err) {
    console.error("❌ Error fetching movements analytics:", err)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
