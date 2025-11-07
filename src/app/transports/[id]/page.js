"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Calendar } from "lucide-react"


export default function TransportDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [transport, setTransport] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    async function fetchTransport() {
      try {
        const res = await fetch(`/api/transports/${id}`)
        if (!res.ok) throw new Error("Failed to fetch transport")
        const data = await res.json()
        setTransport(data)
        setForm(data)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load transport")
      }
    }
    fetchTransport()
  }, [id])

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/transports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to update transport")
      toast.success("Transport updated successfully")
      setEditMode(false)
    } catch (err) {
      console.error(err)
      toast.error("Error updating transport")
    }
  }

  if (!transport) return <div>Loading...</div>

  // 🎨 Badge de status visual
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
      case "in-transit":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">In Transit</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Delivered</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Unknown</Badge>
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="p-8 max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                Transport #{transport._id.slice(-6)}
              </h1>
              <div className="mt-1">{getStatusBadge(transport.status)}</div>
            </div>

            <div className="flex gap-2">
              {transport.relatedMovement && (
                <Button
                  onClick={() => router.push(`/movements/${transport.relatedMovement._id}`)}
                  variant="outline"
                  className="rounded-xl"
                >
                  View Movement
                </Button>
              )}

              {!editMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  Edit Transport
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </div>

          {/* Transport Info */}
          <Card>
            <CardHeader>
              <CardTitle>Transport Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                {editMode ? (
                  <Select
                    value={form.status}
                    onValueChange={(value) => setForm({ ...form, status: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getStatusBadge(transport.status)
                )}
              </div>

              <div>
                <Label>Type</Label>
                <p className="font-medium capitalize">{transport.type}</p>
              </div>

              <div>
                <Label>Driver</Label>
                {editMode ? (
                  <Input
                    value={form.driver || ""}
                    onChange={(e) => setForm({ ...form, driver: e.target.value })}
                  />
                ) : (
                  <p>{transport.driver || "—"}</p>
                )}
              </div>

              <div>
                <Label>Vehicle</Label>
                {editMode ? (
                  <Input
                    value={form.vehicle || ""}
                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  />
                ) : (
                  <p>{transport.vehicle || "—"}</p>
                )}
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(transport.createdAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div>
                <Label>Notes</Label>
                {editMode ? (
                  <Input
                    value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                ) : (
                  <p>{transport.notes || "—"}</p>
                )}
              </div>
            </CardContent>
          </Card>

{/* Client & Route */}
<Card className="overflow-hidden">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-lg font-semibold">Client & Route</CardTitle>

    {transport.destinationClient && (
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl border-border/40 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
        onClick={() => router.push(`/clients/${transport.destinationClient._id}`)}
      >
        View Client
      </Button>
    )}
  </CardHeader>

  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
    {/* Destination */}
    <div className="space-y-1.5">
      <Label className="text-slate-500 text-sm">Destination Client</Label>
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {transport.destinationClient?.name || "—"}
      </p>

      {transport.destinationClient?.address ? (
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(
            transport.destinationClient.address
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline text-sm transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {transport.destinationClient.address}
        </a>
      ) : (
        <p className="text-sm text-slate-500">
          {transport.destinationClient?.email || "—"}
        </p>
      )}
    </div>

    {/* Origin */}
    <div className="space-y-1.5">
      <Label className="text-slate-500 text-sm">Origin Location</Label>
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {transport.originLocation || "—"}
      </p>
    </div>
  </CardContent>
</Card>



          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Product</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {transport.items.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>{item.product?.name || "Unknown"}</td>
                      <td className="text-center">{item.quantity}</td>
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
