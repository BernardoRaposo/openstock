import mongoose, { Schema } from "mongoose"

const LogSchema = new Schema({
  action: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE", "STOCK_ENTRY", "STOCK_EXIT"],
    required: true,
  },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  productName: String,
  details: String,
  timestamp: { type: Date, default: Date.now },
})

export default mongoose.models.Log || mongoose.model("Log", LogSchema)
