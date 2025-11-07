import mongoose from "mongoose"

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: String,
    email: String,
    nif: String,
    location: String,
    notes: String,
  },
  { timestamps: true }
)

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema)
