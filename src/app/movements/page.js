"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"


export default function MovementsPage() {
  const [products, setProducts] = useState([])
const [movements, setMovements] = useState([])
  const [form, setForm] = useState({
    type: "entry",
    productId: "",
    quantity: "",
    location: "",
    responsible: "",
    transportType: "internal",
    description: "",
    clientId: "",

  })
  const [clients, setClients] = useState([])
  const router = useRouter()


  useEffect(() => {
  async function fetchClients() {
    const res = await fetch("/api/clients")
    if (res.ok) setClients(await res.json())
  }
  fetchClients()
}, [])


useEffect(() => {
  async function fetchData() {
    const [pRes, mRes, cRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/movements"),
      fetch("/api/clients"),
    ])
    const pData = await pRes.json()
    const mData = await mRes.json()
    const cData = await cRes.json()

    setProducts(Array.isArray(pData) ? pData : [])
    setMovements(Array.isArray(mData) ? mData : [])
    setClients(Array.isArray(cData) ? cData : [])

  }
  fetchData()
}, [])

async function handleSubmit(e) {
  e.preventDefault()
  const payload = {
    ...form,
    quantity: Number(form.quantity),
  }

  // 🔧 Corrige o nome para clientId
  if (form.clientId) {
    payload.clientId = form.clientId
  } else {
    delete payload.clientId
  }

  const res = await fetch("/api/movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (res.ok) {
    const newMovement = await res.json()
    setMovements((prev) => [newMovement, ...prev])
    setForm({
      type: "entry",
      productId: "",
      quantity: "",
      location: "",
      responsible: "",
      transportType: "internal",
      description: "",
      clientId: "",
    })
  }
}



  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="pt-16 p-8 space-y-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Register Stock Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label>Type</label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry</SelectItem>
                      <SelectItem value="exit">Exit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>Product</label>
                  <Select
                    value={form.productId}
                    onValueChange={(v) => setForm({ ...form, productId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label>Quantity</label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
                  {form.type === "exit" ? (
                    <div>
                      <label>Client</label>
                      <Select
                        value={form.client}
                        onValueChange={(v) => setForm({ ...form, clientId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <label>Location</label>
                      <Input
                        placeholder="e.g. Warehouse A"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
                    </div>
                  )}

                <div>
                  <label>Responsible</label>
                  <Input
                    placeholder="Name of the operator"
                    value={form.responsible}
                    onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                  />
                </div>
                <div>
                  <label>Transport Type</label>
                  <Select
                    value={form.transportType}
                    onValueChange={(v) => setForm({ ...form, transportType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.type === "exit" && form.transportType === "client" ? (
                <div>
                  <label>Client</label>
                  <Select
                    value={form.clientId || ""}
                    onValueChange={(v) => setForm({ ...form, clientId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <label>Location</label>
                  <Input
                    placeholder="e.g. Warehouse A or Client Porto"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              )}

                

                <div className="col-span-2">
                  <label>Description</label>
                  <Input
                    placeholder="Optional details..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="col-span-2 flex justify-end mt-4">
                  <Button type="submit" className="rounded-xl px-6">
                    Register Movement
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Client / Location</th>
                  <th>Responsible</th>
                  <th>Date</th>
                  <th>Actions</th> {/* ✅ nova coluna */}
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m._id} className="border-b">
                    <td>{m.product?.name}</td>
                    <td>
                      {m.type === "entry" ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <ArrowUpCircle className="h-3 w-3" /> Entry
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <ArrowDownCircle className="h-3 w-3" /> Exit
                        </span>
                      )}
                    </td>
                    <td>{m.quantity}</td>
                    <td>{m.type === "exit" ? m.client?.name || "—" : m.location || "—"}</td>
                    <td>{m.responsible}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 flex gap-2"> {/* ✅ esta agora corresponde ao "Actions" */}
                      {m.transport ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-blue-600 hover:bg-blue-100"
                          onClick={() => router.push(`/transports/${m.transport._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View Transport
                        </Button>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No transport</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
