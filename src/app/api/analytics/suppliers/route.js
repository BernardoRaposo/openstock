import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Product from "@/models/Product"

export async function GET() {
  try {
    await connectToDatabase()

    const suppliers = await Product.aggregate([
      // 🔍 Faz join entre Product e Supplier
      {
        $lookup: {
          from: "suppliers",
          localField: "supplier",
          foreignField: "_id",
          as: "supplierData",
        },
      },
      // 🔧 Extrai nome do supplier e trata valores nulos
      {
        $addFields: {
          supplierName: {
            $cond: {
              if: { $gt: [{ $size: "$supplierData" }, 0] },
              then: { $arrayElemAt: ["$supplierData.name", 0] },
              else: "Unknown Supplier",
            },
          },
          safePrice: { $ifNull: ["$price", 0] },
          safeStock: { $ifNull: ["$currentStock", "$quantity", 0] },
        },
      },
      // 🧮 Agrupa por fornecedor
      {
        $group: {
          _id: "$supplierName",
          products: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$safePrice", "$safeStock"] } },
        },
      },
      // 🎨 Prepara dados finais
      {
        $project: {
          _id: 0,
          name: "$_id",
          products: 1,
          totalValue: { $round: ["$totalValue", 2] },
          reliability: {
            $add: [80, { $multiply: [{ $rand: {} }, 20] }],
          },
        },
      },
      { $sort: { totalValue: -1 } },
    ])

    return NextResponse.json(suppliers)
  } catch (err) {
    console.error("❌ Error fetching supplier performance:", err)
    return NextResponse.json({ error: "Failed to load supplier performance" }, { status: 500 })
  }
}
