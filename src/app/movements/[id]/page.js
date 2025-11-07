"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Truck } from "lucide-react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"

export default function MovementDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [movement, setMovement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovement() {
      try {
        const res = await fetch(`/api/movements/${id}`)
        if (!res.ok) throw new Error("Failed to fetch movement")
        const data = await res.json()
        setMovement(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMovement()
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading movement details...</div>
  }

  if (!movement) {
    return <div className="p-8 text-center text-red-500">Movement not found.</div>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="pt-16 p-8 max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Movement <span className="text-muted-foreground">#{movement._id.slice(-6)}</span>
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/movements")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {movement.transport && (
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  onClick={() => router.push(`/transports/${movement.transport._id}`)}
                >
                  <Truck className="h-4 w-4 mr-2" /> View Transport
                </Button>
              )}
            </div>
          </div>

          {/* Movement Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Movement Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium flex items-center gap-2">
                  {movement.type === "entry" ? (
                    <Badge variant="success">Entry</Badge>
                  ) : (
                    <Badge variant="destructive">Exit</Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{movement.product?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{movement.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responsible</p>
                <p className="font-medium">{movement.responsible}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transport Type</p>
                <p className="font-medium capitalize">{movement.transportType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="font-medium">{movement.currentStock}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{movement.description || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Client & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Client / Location</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">
                  {movement.client ? movement.client.name : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{movement.location || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="text-sm text-muted-foreground text-right">
            Created at: {new Date(movement.createdAt).toLocaleString()}
          </div>
        </main>
      </div>
    </div>
  )
}
