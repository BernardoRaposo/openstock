"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, MoreVertical, Pencil, Trash2, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    nif: "",
    location: "",
    notes: "",
  })
  const [searchQuery, setSearchQuery] = useState("")

  // 🧠 Fetch suppliers
  useEffect(() => {
    async function fetchSuppliers() {
      const res = await fetch("/api/suppliers")
      const data = await res.json()
      setSuppliers(data)
    }
    fetchSuppliers()
  }, [])

  // ✍️ Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ➕ Add / Update supplier
  const handleSaveSupplier = async () => {
    const method = editingSupplier ? "PUT" : "POST"
    const url = editingSupplier ? `/api/suppliers/${editingSupplier._id}` : "/api/suppliers"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    const data = await res.json()
    if (res.ok) {
      if (editingSupplier) {
        setSuppliers((prev) => prev.map((s) => (s._id === data._id ? data : s)))
      } else {
        setSuppliers((prev) => [data, ...prev])
      }
      setIsModalOpen(false)
      setEditingSupplier(null)
      setFormData({ name: "", contact: "", email: "", nif: "", location: "", notes: "" })
    } else {
      console.error("Failed to save supplier:", data.error)
    }
  }

  // 🗑️ Delete supplier
  const handleDeleteSupplier = async (id) => {
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" })
    setSuppliers((prev) => prev.filter((s) => s._id !== id))
  }

  // 🖊️ Edit supplier
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier)
    setFormData(supplier)
    setIsModalOpen(true)
  }

  const filteredSuppliers = suppliers.filter((s) =>
    [s.name, s.contact, s.email, s.location].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="pt-16">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Suppliers</h1>
                <p className="mt-2 text-base text-muted-foreground">
                  Manage your supplier database
                </p>
              </div>
              <Button
                className="gap-2 gradient-primary shadow-lg hover:scale-105 transition-all duration-200 rounded-xl px-6"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search suppliers by name, email or location..."
                className="pl-10 rounded-xl bg-white/80 dark:bg-card/80 border-border/50 shadow-sm focus-visible:shadow-md transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table */}
            <Card className="border-border/50 rounded-2xl floating-shadow">
              <CardHeader>
                <CardTitle className="text-foreground text-lg font-semibold">
                  All Suppliers ({filteredSuppliers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-left">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Contact</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">NIF</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No suppliers found.
                          </td>
                        </tr>
                      ) : (
                        filteredSuppliers.map((s) => (
                          <tr key={s._id} className="border-b border-border/30 last:border-0 hover:bg-secondary/50">
                            <td className="py-4 font-medium">{s.name}</td>
                            <td>{s.contact || "-"}</td>
                            <td>{s.email || "-"}</td>
                            <td>{s.nif || "-"}</td>
                            <td>{s.location || "-"}</td>
                            <td className="py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/80">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditSupplier(s)}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteSupplier(s._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {["name", "contact", "email", "nif", "location"].map((field) => (
              <div key={field} className="space-y-1">
                <Label className="capitalize">{field}</Label>
                <Input
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSupplier}>
              {editingSupplier ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
