"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, BarChart3, PieChart as PieIcon, Package, Users, Clock, DollarSign } from "lucide-react"


// 🎨 Mock data (irá depois ser substituído por dados reais)
const mockStockValue = [
  { day: "Oct 1", value: 4200 },
  { day: "Oct 5", value: 4800 },
  { day: "Oct 10", value: 5200 },
  { day: "Oct 15", value: 5000 },
  { day: "Oct 20", value: 5300 },
  { day: "Oct 25", value: 5400 },
  { day: "Oct 30", value: 5500 },
]

const mockMovements = [
  { day: "Oct 1", entries: 35, exits: 25 },
  { day: "Oct 5", entries: 50, exits: 30 },
  { day: "Oct 10", entries: 20, exits: 40 },
  { day: "Oct 15", entries: 60, exits: 45 },
  { day: "Oct 20", entries: 25, exits: 35 },
  { day: "Oct 25", entries: 30, exits: 20 },
  { day: "Oct 30", entries: 40, exits: 25 },
]

const mockMargins = [
  { category: "Electronics", margin: 32 },
  { category: "Furniture", margin: 18 },
  { category: "Clothing", margin: 25 },
  { category: "Groceries", margin: 12 },
  { category: "Tools", margin: 28 },
]

const mockSuppliers = [
  { name: "Etavis", products: 12, totalValue: 8300, reliability: 94 },
  { name: "Fenix Trade", products: 8, totalValue: 5200, reliability: 87 },
  { name: "SomaTech", products: 15, totalValue: 11200, reliability: 91 },
  { name: "Ocean Imports", products: 5, totalValue: 3100, reliability: 89 },
]

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#e11d48"]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d")
  const [stockValueData, setStockValueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [movementData, setMovementData] = useState([])
  const [margins, setMargins] = useState([])
  const [suppliers, setSuppliers] = useState([])

useEffect(() => {
  async function fetchSuppliers() {
    try {
      const res = await fetch("/api/analytics/suppliers")
      if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.status}`)
      const data = await res.json()
      setSuppliers(data)
    } catch (err) {
      console.error(err)
    }
  }

  fetchSuppliers()
}, [])

useEffect(() => {
  async function fetchMargins() {
    try {
      const res = await fetch("/api/analytics/margins")
      if (!res.ok) throw new Error(`Failed to fetch margins: ${res.status}`)
      const data = await res.json()
      setMargins(data)
    } catch (err) {
      console.error(err)
    }
  }

  fetchMargins()
}, [])


useEffect(() => {
  async function fetchStockValue() {
    try {
      const res = await fetch("/api/analytics/value")
      const data = await res.json()

      if (Array.isArray(data.history)) {
        // 🔁 Formatar dados para o gráfico
        const formatted = data.history.map((d) => ({
          day: new Date(d.day).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          value: d.value,
        }))
        setStockValueData(formatted)
      }
    } catch (err) {
      console.error("Error fetching stock value:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchStockValue()
}, [])

useEffect(() => {
  async function fetchMovements() {
    try {
      const res = await fetch("/api/analytics/movements")
      if (!res.ok) {
        console.error("❌ Failed to fetch movements:", res.status)
        return
      }

      const text = await res.text()
      if (!text) {
        console.warn("⚠️ Empty response from /api/analytics/movements")
        return
      }

      const data = JSON.parse(text)

      if (Array.isArray(data)) {
        const formatted = data.map((d) => ({
          day: new Date(d.day).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          entries: d.entries || 0,
          exits: d.exits || 0,
        }))
        setMovementData(formatted)
      }
    } catch (err) {
      console.error("Error fetching movements:", err)
    }
  }

  fetchMovements()
}, [])




  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                  Analytics
                </h1>
                <p className="text-slate-600 mt-2">
                  Visualize trends, performance and stock efficiency across your inventory.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {["7d", "30d", "90d"].map((p) => (
                  <Badge
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`cursor-pointer px-3 py-1 rounded-full text-sm ${
                      period === p
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "bg-white/70 text-slate-700 border border-slate-200"
                    }`}
                  >
                    Last {p}
                  </Badge>
                ))}
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Stock Value",
                  value: "€5,500",
                  change: "+3.5%",
                  icon: DollarSign,
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  title: "Active Suppliers",
                  value: "12",
                  change: "+1",
                  icon: Users,
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Avg. Margin",
                  value: "23.8%",
                  change: "+0.8%",
                  icon: PieIcon,
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  title: "Stock Turnover Time",
                  value: "12.3 days",
                  change: "-1.2%",
                  icon: Clock,
                  gradient: "from-orange-500 to-amber-500",
                },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={stat.title}
                    className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                      <p className="text-xs text-slate-500 mt-1">{stat.change} vs prev period</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* GRÁFICOS PRINCIPAIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Value */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <TrendingUp className="h-5 w-5 text-blue-500" /> Stock Value Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {!loading && stockValueData.length === 0 && (
                    <p className="text-center text-sm text-slate-500 mt-4">No data yet — add stock movements to see trends.</p>
                  )}

                  </div>
                </CardContent>
              </Card>

              {/* Entries vs Exits */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <BarChart3 className="h-5 w-5 text-purple-500" /> Stock Movements (Entries vs Exits)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={movementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="entries" fill="#2563eb" name="Entries" />
                        <Bar dataKey="exits" fill="#9333ea" name="Exits" />
                      </BarChart>
                    </ResponsiveContainer>

                    {movementData.length === 0 && (
                      <p className="text-center text-sm text-slate-500 mt-4">
                        No movement data yet — add entries or exits to populate this chart.
                      </p>
                    )}

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MARGINS */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <PieIcon className="h-5 w-5 text-green-500" /> Category Profit Margins
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                {margins.length > 0 ? (
                  <>
                    <div className="h-64 w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={margins}
                            dataKey="margin"
                            nameKey="category"
                            outerRadius={100}
                            label
                          >
                            {margins.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#2563eb", "#16a34a", "#f97316", "#9333ea", "#e11d48"][index % 5]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {margins.map((item, index) => (
                        <div key={item.category} className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{item.category}</span>
                          <span className="text-slate-600">{item.margin}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm text-center w-full">
                    No margin data available yet — add products with price and cost to see this chart.
                  </p>
                )}
              </CardContent>
            </Card>


            {/* SUPPLIERS */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Package className="h-5 w-5 text-orange-500" /> Supplier Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suppliers.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Supplier</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600">Products</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600">Total Value (€)</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600">Reliability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((s, i) => (
                        <tr
                          key={s.name}
                          className={`border-b border-slate-100 ${
                            i % 2 === 0 ? "bg-slate-50/30" : "bg-transparent"
                          } hover:bg-blue-50/50`}
                        >
                          <td className="py-3 px-4 font-medium text-slate-800">{s.name}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{s.products}</td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {s.totalValue.toLocaleString("pt-PT")}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {Math.round(s.reliability)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 text-sm text-center w-full">
                    No supplier data available yet — add products with supplier info to see this chart.
                  </p>
                )}
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
