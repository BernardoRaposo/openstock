"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PlusCircle, Pencil, Trash2, Building2, Phone, Mail, FileText, Eye } from "lucide-react"
import { useRouter } from "next/navigation"


export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [open, setOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    nif: "",
    address: "",
    notes: "",
  })
  const router = useRouter()
  const [search, setSearch] = useState("")

  const filteredClients = clients.filter(c =>
  c.name.toLowerCase().includes(search.toLowerCase()) ||
  c.email?.toLowerCase().includes(search.toLowerCase()) ||
  c.company?.toLowerCase().includes(search.toLowerCase())
)


  // ✅ Buscar todos os clientes
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(data)
    } catch (err) {
      console.error("Error fetching clients:", err)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // ✅ Guardar (criar ou atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editingClient ? "PUT" : "POST"
      const url = editingClient ? `/api/clients/${editingClient._id}` : "/api/clients"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Failed to save client")

      toast.success(editingClient ? "Client updated!" : "Client added!")
      setOpen(false)
      setForm({ name: "", company: "", email: "", phone: "", nif: "", address: "", notes: "" })
      setEditingClient(null)
      fetchClients()
    } catch (err) {
      console.error(err)
      toast.error("Error saving client")
    }
  }

  // ✅ Apagar cliente
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this client?")) return
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" })
      toast.success("Client deleted")
      fetchClients()
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete client")
    }
  }

  // ✅ Abrir modal de edição
  const handleEdit = (client) => {
    setEditingClient(client)
    setForm(client)
    setOpen(true)
  }

  const handleExportCSV = async () => {
  const res = await fetch("/api/clients")
  if (!res.ok) return toast.error("Failed to fetch clients")

  const data = await res.json()
  const headers = ["Name", "Email", "Phone", "NIF", "Address", "Notes"]
  const csv = [
    headers.join(","),
    ...data.map((c) =>
      [c.name, c.email, c.phone, c.nif, c.address, c.notes?.replace(/,/g, ";") || ""].join(",")
    ),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "clients.csv"
  a.click()
  toast.success("Clients exported to CSV!")
}


  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                  Clients
                </h1>
                <p className="text-slate-600 mt-2">
                  Manage your customers and their contact information.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="rounded-xl bg-white/80 dark:bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all"
                >
                  Export CSV
                </Button>

                <Button
                  onClick={() => {
                    setForm({
                      name: "",
                      company: "",
                      email: "",
                      phone: "",
                      nif: "",
                      address: "",
                      notes: "",
                    })
                    setEditingClient(null)
                    setOpen(true)
                  }}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 px-6"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Client
                </Button>
              </div>

            </div>

            {/* Clients List */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Client List
                </CardTitle>
              </CardHeader>


              <CardContent>
              
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Company</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Phone</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr
                        key={client._id}
                        className="border-b border-slate-100 hover:bg-blue-50/40 transition"
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">{client.name}</td>
                        <td className="py-3 px-4 text-slate-600">{client.company}</td>
                        <td className="py-3 px-4 text-slate-600">{client.email}</td>
                        <td className="py-3 px-4 text-slate-600">{client.phone}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/clients/${client._id}`)}
                            className="rounded-lg text-blue-600 hover:bg-blue-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(client)}
                            className="rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(client._id)}
                            className="rounded-lg text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Modal */}
            {open && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                  <h2 className="text-xl font-semibold mb-4">
                    {editingClient ? "Edit Client" : "Add New Client"}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {["name", "company", "email", "phone", "nif", "address", "notes"].map((field) => (
                      <div key={field} className="grid gap-2">
                        <Label htmlFor={field} className="capitalize">
                          {field}
                        </Label>
                        <Input
                          id={field}
                          value={form[field]}
                          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                          required={field === "name"}
                        />
                      </div>
                    ))}

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
                        {editingClient ? "Save Changes" : "Add Client"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
