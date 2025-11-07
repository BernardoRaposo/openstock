import mongoose from "mongoose"

const PurchaseOrderSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        unitCost: { type: Number, required: true },
      },
    ],
    status: { type: String, enum: ["ordered", "received", "cancelled"], default: "ordered" },
    expectedDate: { type: Date },
    total: { type: Number, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", PurchaseOrderSchema)
