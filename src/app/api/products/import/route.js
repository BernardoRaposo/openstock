import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Product from "@/models/Product"
import Supplier from "@/models/Supplier"
import removeAccents from "remove-accents"

export async function POST(req) {
  try {
    await connectToDatabase()
    const { products } = await req.json()

    let createdCount = 0
    let updatedCount = 0
    let supplierCache = new Map()

    for (const p of products) {
      // 🧠 Normaliza supplier
      let supplierId = null
        if (p.supplier) {
        // 🔤 Normaliza o nome para comparação
        const normalized = removeAccents(p.supplier).trim().toLowerCase().replace(/\s+/g, " ")

        // ⚡ Usa cache local se já foi visto neste import
        if (supplierCache.has(normalized)) {
            supplierId = supplierCache.get(normalized)
        } else {
            // 🔍 Busca robusta por nome (case-insensitive)
            const existing = await Supplier.findOne({
            name: { $regex: new RegExp(`^${normalized}$`, "i") },
            })

            if (existing) {
            supplierId = existing._id
            } else {
            const newSupplier = await Supplier.create({
                name: p.supplier.trim().replace(/\s+/g, " "),
            })
            supplierId = newSupplier._id
            }

            supplierCache.set(normalized, supplierId)
        }
        }

      // 🔍 Verifica se o produto já existe pelo SKU
      const existingProduct = await Product.findOne({ sku: p.sku })

      if (existingProduct) {
        // 🔁 Atualiza campos existentes
        existingProduct.name = p.name || existingProduct.name
        existingProduct.category = p.category || existingProduct.category
        existingProduct.quantity = Number(p.quantity) || existingProduct.quantity
        existingProduct.price = Number(p.price) || existingProduct.price
        existingProduct.cost = Number(p.cost) || existingProduct.cost
        existingProduct.supplier = supplierId || existingProduct.supplier
        await existingProduct.save()
        updatedCount++
      } else {
        // ➕ Cria novo produto
        await Product.create({
          name: p.name,
          sku: p.sku,
          category: p.category || "",
          quantity: Number(p.quantity) || 0,
          price: Number(p.price) || 0,
          cost: Number(p.cost) || 0,
          supplier: supplierId,
        })
        createdCount++
      }
    }

    return NextResponse.json({
      message: `✅ Import complete — ${createdCount} new, ${updatedCount} updated`,
    })
  } catch (err) {
    console.error("❌ Error importing products:", err)
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 })
  }
}
