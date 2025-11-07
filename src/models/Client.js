import mongoose from "mongoose"

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    vatNumber: { type: String, trim: true },
    notes: { type: String, default: "" },

    // 🧠 Campos adicionais úteis para CRM (sem impacto nas features atuais)
    totalPurchases: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
    lastPurchaseAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// ✅ Usa fallback seguro para evitar undefined
export default mongoose.models?.Client || mongoose.model("Client", ClientSchema)
