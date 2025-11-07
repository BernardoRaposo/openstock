"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, CheckCircle, PackageSearch } from "lucide-react"

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    supplier: "",
    items: [{ product: "", quantity: 1, unitCost: 0 }],
    expectedDelivery: "",
    notes: "",
  })

  // Fetch orders, products, suppliers
  useEffect(() => {
    async function fetchData() {
      const [ordersRes, productsRes, suppliersRes] = await Promise.all([
        fetch("/api/purchase-orders"),
        fetch("/api/products"),
        fetch("/api/suppliers"),
      ])
      const [ordersData, productsData, suppliersData] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        suppliersRes.json(),
      ])
      setOrders(ordersData)
      setProducts(productsData)
      setSuppliers(suppliersData)
    }
    fetchData()
  }, [])

  // Add or edit items dynamically
  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items]
      items[index][field] = value
      return { ...prev, items }
    })
  }

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { product: "", quantity: 1, unitCost: 0 }] }))

  // Create new purchase order
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create order")

      toast.success("Purchase order created!")
      setOpen(false)
      const newOrders = await (await fetch("/api/purchase-orders")).json()
      setOrders(newOrders)
    } catch (err) {
      toast.error("Error creating purchase order")
      console.error(err)
    }
  }

  // Mark order as received
  const markAsReceived = async (id) => {
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "received" }),
      })
      if (!res.ok) throw new Error("Failed to mark as received")

      toast.success("Order marked as received!")
      const updated = await (await fetch("/api/purchase-orders")).json()
      setOrders(updated)
    } catch (err) {
      toast.error("Error updating order")
      console.error(err)
    }
  }

  const handleProductSelect = async (index, productId) => {
  try {
    const res = await fetch(`/api/products/${productId}`)
    if (!res.ok) throw new Error("Failed to fetch product details")
    const data = await res.json()

    const updatedItems = [...form.items]
    updatedItems[index].product = productId
    updatedItems[index].unitCost = data.cost || 0 // Auto-preenche com o custo do produto

    setForm({ ...form, items: updatedItems })
  } catch (error) {
    console.error("Error fetching product cost:", error)
  }
}


  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                  Purchase Orders
                </h1>
                <p className="text-slate-600 mt-1">Manage and track all supplier purchase orders.</p>
              </div>
              <Button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" /> New Order
              </Button>
            </div>

            {/* Orders Table */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>All Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Supplier</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Items</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Total (€)</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Expected</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {order.supplier?.name || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {order.items.map((i) => i.product?.name || "Unknown").join(", ")}
                          </td>
                          <td className="py-3 px-4 text-slate-600">€{order.total?.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`rounded-full px-3 py-1 ${
                                order.status === "received"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "ordered"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "draft"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {order.expectedDelivery
                              ? new Date(order.expectedDelivery).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            {order.status !== "received" && (
                              <Button
                                onClick={() => markAsReceived(order._id)}
                                size="sm"
                                variant="outline"
                                className="rounded-lg text-green-700 border-green-300 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Mark as Received
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* New Order Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-slate-900">New Purchase Order</DialogTitle>
                </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Supplier */}
                    <div className="grid gap-2">
                        <Label>Supplier</Label>
                        <select
                        name="supplier"
                        value={form.supplier}
                        onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                        required
                        >
                        <option value="">Select Supplier</option>
                        {suppliers.map((s) => (
                            <option key={s._id} value={s._id}>
                            {s.name}
                            </option>
                        ))}
                        </select>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        <Label>Items</Label>
                        {form.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-3">
                            <select
                            value={item.product}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                            className="border rounded-lg px-3 py-2"
                            required
                            >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                {p.name}
                                </option>
                            ))}
                            </select>

                            <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            />

                            <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(index, "unitCost", e.target.value)}
                            />
                        </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addItem}>
                        <PackageSearch className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>

                    {/* Expected Delivery */}
                    <div className="grid gap-2">
                        <Label>Expected Delivery</Label>
                        <Input
                        type="date"
                        value={form.expectedDelivery}
                        onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
                        />
                    </div>

                    {/* Notes */}
                    <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Input
                        type="text"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="e.g., Weekly restock"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="rounded-xl"
                        >
                        Cancel
                        </Button>
                        <Button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        >
                        Create Order
                        </Button>
                    </div>
                    </form>

              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
