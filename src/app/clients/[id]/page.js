"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function ClientProfile() {
  const { id } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/clients/${id}`)
      if (res.ok) setData(await res.json())
    }
    fetchData()
  }, [id])

  if (!data) return <div>Loading...</div>

  const { client, stats, movements } = data

  // 🟡 Badges dinâmicas
  const badges = []
  if (stats.totalQuantity > 100) badges.push("VIP")
  if (Date.now() - new Date(stats.lastPurchaseAt) < 30 * 24 * 60 * 60 * 1000)
    badges.push("Active")
  else if (Date.now() - new Date(stats.lastPurchaseAt) > 60 * 24 * 60 * 60 * 1000)
    badges.push("Inactive")
  if (stats.totalMovements < 2) badges.push("New")

  // 📊 Preparar dados para o mini gráfico
  const monthlyData = movements.reduce((acc, m) => {
    const month = new Date(m.createdAt).toLocaleString("default", { month: "short" })
    acc[month] = (acc[month] || 0) + m.quantity
    return acc
  }, {})
  const chartData = Object.entries(monthlyData).map(([month, qty]) => ({ month, qty }))

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="pt-16 p-8 max-w-5xl mx-auto space-y-8">

          {/* 🧩 Perfil do cliente */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {client.name}
                <div className="flex gap-2">
                  {badges.map((b) => (
                    <span
                      key={b}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b === "VIP"
                          ? "bg-yellow-100 text-yellow-800"
                          : b === "Active"
                          ? "bg-green-100 text-green-800"
                          : b === "Inactive"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Email:</strong> {client.email || "—"}</p>
              <p><strong>Phone:</strong> {client.phone || "—"}</p>
              <p><strong>NIF:</strong> {client.nif || "—"}</p>
              <p><strong>Address:</strong> {client.address || "—"}</p>
              <p className="col-span-2"><strong>Notes:</strong> {client.notes || "—"}</p>
            </CardContent>
          </Card>

          {/* 📈 Estatísticas */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.totalMovements}</p>
                <p className="text-sm text-muted-foreground">Movements</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuantity}</p>
                <p className="text-sm text-muted-foreground">Units Moved</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalValue?.toFixed(2) || 0}€</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.lastPurchaseAt ? new Date(stats.lastPurchaseAt).toLocaleDateString() : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Last Activity</p>
              </div>
            </CardContent>
          </Card>

          {/* 🥇 Top Products */}
          {stats.topProducts?.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {stats.topProducts.map((p) => (
                    <li key={p.name} className="flex justify-between py-2 text-sm">
                      <span>{p.name}</span>
                      <span className="font-semibold">{p.qty}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 📊 Mini gráfico */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Activity (Last Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="month" />
                  <Tooltip />
                  <Bar dataKey="qty" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 🧾 Movimentos recentes */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m._id} className="border-b hover:bg-blue-50/30 transition">
                      <td>{m.product?.name}</td>
                      <td>{m.type}</td>
                      <td>{m.quantity}</td>
                      <td>{new Date(m.createdAt).toLocaleString()}</td>
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
