import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true, trim: true },
  category: String,
  quantity: Number,
  price: Number,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  cost: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
