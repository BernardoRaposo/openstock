import fs from "fs"
import csv from "csv-parser"
import mongoose from "mongoose"
import Product from "../models/Product.js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: "inventory" })
  const products = []

  fs.createReadStream("src/script/seed.csv")
    .pipe(csv())
    .on("data", (row) => {
      products.push({
        name: row.name,
        sku: row.sku,
        category: row.category,
        quantity: Number(row.quantity),
        price: Number(row.price),
        cost: Number(row.cost),
      })
    })
    .on("end", async () => {
      await Product.deleteMany({})
      await Product.insertMany(products)
      console.log(`✅ Inserted ${products.length} products`)
      mongoose.connection.close()
    })
}

seed()
