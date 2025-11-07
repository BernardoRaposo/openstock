"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" // para mostrar notificações

export function ProductModal({ open, onOpenChange, product, onSave }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    price: "",
    supplier:"",
    cost: "",
  })
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState([])

useEffect(() => {
  async function fetchSuppliers() {
    try {
      const res = await fetch("/api/suppliers")
      const data = await res.json()
      setSuppliers(data)
    } catch (err) {
      console.error("Error fetching suppliers:", err)
    }
  }
  fetchSuppliers()
}, [])

  // Quando abre em modo de edição, preenche o formulário
useEffect(() => {
  if (product) {
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      quantity: product.quantity || "",
      price: product.price || "",
      cost: product.cost || "",
      supplier:
        typeof product.supplier === "object"
          ? product.supplier?._id || ""
          : product.supplier || "",
    })
  } else {
    setForm({ name: "", sku: "", category: "", quantity: "", price: "", supplier: "", cost: "" })
  }
}, [product, open])

  // Atualiza campos
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Envia os dados
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      supplier: form.supplier || null,
      cost: Number(form.cost),
    }

    try {
      await onSave(payload)
      toast.success(product ? "Product updated successfully!" : "Product added successfully!")
      onOpenChange(false)
      setForm({ name: "", sku: "", category: "", quantity: "", price: "", supplier: "", cost: "" })
    } catch (err) {
      console.error("Error saving product:", err)
      toast.error("Something went wrong while saving.")
    } finally {
      setLoading(false)
    }
  }

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-white/90 backdrop-blur-md border border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {product
              ? "Update product details below."
              : "Fill in the details to add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Wireless Mouse"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              placeholder="e.g., WM-001"
              value={form.sku}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g., Electronics"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                placeholder="e.g., 50"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="e.g., 29.99"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-3">
            <Label htmlFor="cost">Cost (€)</Label>
            <Input
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              placeholder="e.g., 18.50"
              value={form.cost}
              onChange={handleChange}
            />
          </div>
            
          </div>

          <div className="grid gap-3">
            <Label htmlFor="supplier">Supplier</Label>
            <select
              id="supplier"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="w-full border border-border/50 rounded-md p-2 bg-white/80 dark:bg-card/80"
            >
              <option value="">— Select Supplier —</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
