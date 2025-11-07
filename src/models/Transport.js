import mongoose from "mongoose"

const TransportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["delivery", "pickup", "internal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    date: { type: Date, default: Date.now },
    driver: { type: String, required: true },
    vehicle: { type: String },

    // 🔗 Relações diretas e opcionais
    originClient: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    destinationClient: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    originLocation: { type: String }, // ou ref futura a um modelo "Location"
    destinationLocation: { type: String },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],

    relatedMovement: { type: mongoose.Schema.Types.ObjectId, ref: "StockMovement" },
    notes: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.Transport || mongoose.model("Transport", TransportSchema)
