import mongoose from "mongoose"

const StockMovementSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["entry", "exit"], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    responsible: { type: String, required: true },
    transportType: { type: String, enum: ["supplier", "client", "internal"], required: true },
    description: { type: String, default: "" },
    currentStock: { type: Number, required: true },

    // 🧠 Guarda o preço real do produto neste momento
    priceAtMovement: { type: Number, default: 0 },

    // 👇 Cliente associado ao movimento (opcional)
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },

    // 🚚 Transporte associado (opcional)
    transport: { type: mongoose.Schema.Types.ObjectId, ref: "Transport", default: null },
  },
  { timestamps: true }
)

export default mongoose.models.StockMovement ||
  mongoose.model("StockMovement", StockMovementSchema)
