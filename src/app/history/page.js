"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    async function fetchLogs() {
      const res = await fetch("/api/logs")
      const data = await res.json()
      setLogs(data)
    }
    fetchLogs()
  }, [])

  const getColor = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-700"
      case "UPDATE":
        return "bg-blue-100 text-blue-700"
      case "DELETE":
        return "bg-red-100 text-red-700"
      case "STOCK_IN":
        return "bg-emerald-100 text-emerald-700"
      case "STOCK_OUT":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="p-8 pt-16">
          <h1 className="text-3xl font-semibold text-foreground mb-8">Activity Log</h1>

          <Card className="border-border/50 rounded-2xl floating-shadow">
            <CardHeader>
              <CardTitle className="text-foreground text-lg font-semibold">
                Latest System Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Action</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Product</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Details</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          No actions logged yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="border-b border-border/30 last:border-0 hover:bg-secondary/50">
                          <td className="py-4 text-sm font-medium">
                            <Badge className={`${getColor(log.action)} rounded-full px-3 py-1`}>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm">{log.productName}</td>
                          <td className="py-4 text-sm text-muted-foreground">{log.details}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
