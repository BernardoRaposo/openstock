"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Settings, BarChart3, FileArchiveIcon, RecycleIcon, User2Icon, Archive, UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/", icon:  LayoutDashboard},
    { name: "Movements", href: "/movements", icon: RecycleIcon },
    { name: "Orders", href: "/purchase-orders", icon: Archive },
    { name: "Products", href: "/products", icon: Package },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Log", href: "/history", icon: FileArchiveIcon },
    { name: "Suppliers", href: "/suppliers", icon: User2Icon },
    { name: "Clients", href: "/clients", icon: UserIcon },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 border-r border-slate-200/50 bg-white/40 backdrop-blur-xl flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-200/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          InventoryPro
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage with ease</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  isActive && "text-white",
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/50">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">John Doe</p>
            <p className="text-xs text-slate-500 truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
