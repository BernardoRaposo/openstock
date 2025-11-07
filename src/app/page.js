"use client"

import { useEffect, useState } from "react"
import { Package, TrendingUp, AlertCircle, DollarSign, Star, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function DashboardPage() {
  const [products, setProducts] = useState([])
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState([])
  const [insight, setInsight] = useState("")
  const [stockTrend, setStockTrend] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [resProducts, resLogs] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/logs"),
        ])

        const [productsData, logsData] = await Promise.all([
          resProducts.json(),
          resLogs.json(),
        ])

        setProducts(productsData)
        setLogs(logsData)

        // KPIs principais
        const totalProducts = productsData.length
        const lowStock = productsData.filter((p) => p.quantity < 10).length
        const totalValue = productsData.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0)
        const totalCost = productsData.reduce((sum, p) => sum + (p.cost || 0) * (p.quantity || 0), 0)
        const potentialProfit = totalValue - totalCost

        setStats([
          {
            title: "Total Products",
            value: totalProducts.toString(),
            icon: Package,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Low Stock Items",
            value: lowStock.toString(),
            icon: AlertCircle,
            gradient: "from-orange-500 to-red-500",
          },
          {
            title: "Total Stock Value",
            value: `€${totalValue.toLocaleString()}`,
            icon: DollarSign,
            gradient: "from-green-500 to-emerald-500",
          },
          {
            title: "Potential Profit",
            value: `€${potentialProfit.toLocaleString()}`,
            icon: TrendingUp,
            gradient: "from-purple-500 to-pink-500",
          },
        ])

        // Stock trend real baseado em logs
        const stockByDay = {}
        const today = new Date()

        // Criar estrutura base (últimos 7 dias)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(today.getDate() - i)
          const key = date.toISOString().split("T")[0]
          stockByDay[key] = 0
        }

        // Processar logs que têm movimento de stock
        logsData.forEach((log) => {
          if (!log.action || !log.timestamp || !log.quantity) return

          const dateKey = new Date(log.timestamp).toISOString().split("T")[0]
          if (!stockByDay[dateKey]) return

          if (log.action === "ADD_STOCK") stockByDay[dateKey] += log.quantity
          if (log.action === "REMOVE_STOCK") stockByDay[dateKey] -= log.quantity
        })

        // Converter para array e acumular
        const trendArray = Object.entries(stockByDay).map(([date, change]) => ({
          date,
          change,
        }))

        // Acumular a partir de stock atual
        const totalStock = productsData.reduce((sum, p) => sum + (p.quantity || 0), 0)
        let accumulated = totalStock

        const trendWithCumulative = [...trendArray]
          .reverse()
          .map((item) => {
            accumulated -= item.change
            return { day: item.date.slice(5), stock: accumulated }
          })
          .reverse()

        setStockTrend(trendWithCumulative)

        // Insight simples
        const avgStock = productsData.reduce((sum, p) => sum + p.quantity, 0) / (totalProducts || 1)
        const insightText =
          avgStock < 10
            ? "🚨 O stock médio dos produtos está muito baixo. Considera fazer novas encomendas."
            : lowStock > totalProducts / 4
            ? "⚠️ Muitos produtos com baixo stock. Planeia uma reposição."
            : "✅ O inventário está equilibrado e saudável esta semana."
        setInsight(insightText)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }

    fetchData()
  }, [])

  const getTopProducts = () => {
    if (!products.length) return []
    const byQuantity = [...products].sort((a, b) => b.quantity - a.quantity)[0]
    const byMargin = [...products]
      .filter((p) => p.price && p.cost)
      .sort((a, b) => b.price - b.cost - (a.price - a.cost))[0]
    const lowStock = [...products].filter((p) => p.quantity < 5)[0]

    return [
      { label: "Mais em Stock", product: byQuantity },
      { label: "Maior Margem", product: byMargin },
      { label: "Quase a Esgotar", product: lowStock },
    ].filter((item) => item.product)
  }

  const formatDate = (d) => {
    if (!d) return "—"
    const date = new Date(d)
    return isNaN(date)
      ? "—"
      : date.toLocaleString("pt-PT", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600">Welcome back! Here's what's happening with your inventory.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title} className="group relative overflow-hidden border-0 shadow-lg bg-white/80">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Stock Trend (agora real) */}
            <Card className="border-0 shadow-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">Stock Trend (last 7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="stock" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Product Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getTopProducts().map(({ label, product }) => (
                  <Card key={label} className="border-0 shadow-lg bg-white/80 p-4">
                    <CardTitle className="text-sm text-slate-600 mb-1">{label}</CardTitle>
                    <div className="text-lg font-semibold text-slate-900">{product.name}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {product.quantity} units • €{product.price?.toFixed(2)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-200">
                  {logs.slice(0, 6).map((log) => (
                    <li key={log._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-800">{log.details}</span>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(log.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Insight */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-100 to-purple-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Inventory Insight</h3>
              <p className="text-slate-700 text-sm">{insight}</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
