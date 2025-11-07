"use client"

import { useEffect, useState, useMemo } from "react"
import { Topbar } from "@/components/Topbar"
import { Sidebar } from "@/components/Sidebar"
import { ProductModal } from "@/components/product-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, MoreVertical, Pencil, Trash2, Search, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Papa from "papaparse"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"


export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [csvPreview, setCsvPreview] = useState([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)


  // 🧠 Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error("Error loading products:", err)
      }
    }
    fetchProducts()
  }, [])

  // ⚙️ Helpers
  const calculateStatus = (quantity) => {
    if (quantity === 0) return "Out of Stock"
    if (quantity < 20) return "Low Stock"
    return "In Stock"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    }
  }

  // 🧩 Add or Edit product
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })
        const updated = await res.json()
        setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })
        const newProduct = await res.json()
        setProducts((prev) => [newProduct, ...prev])
      }
    } catch (err) {
      console.error("Error saving product:", err)
    } finally {
      setEditingProduct(undefined)
    }
  }

  // 🗑️ Delete product
  const handleDeleteProduct = async (id) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" })
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      console.error("Error deleting product:", err)
    }
  }

  // 🖊️ Edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  // ➕ Add product
  const handleAddProduct = () => {
    setEditingProduct(undefined)
    setIsModalOpen(true)
  }

  // 🔎 Filtros e pesquisa
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(calculateStatus(product.quantity))

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, searchQuery, selectedCategories, selectedStatuses])

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
  const statuses = ["In Stock", "Low Stock", "Out of Stock"]


  const handleExportCSV = () => {
  if (!filteredProducts.length) {
    alert("No products to export.")
    return
  }

  const csv = Papa.unparse(
    filteredProducts.map((p) => ({
      Name: p.name,
      SKU: p.sku,
      Category: p.category,
      Quantity: p.quantity,
      Price: p.price?.toFixed(2),
      Status: calculateStatus(p.quantity),
    }))
  )

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, `openstock_products_${new Date().toISOString().split("T")[0]}.csv`)
}

// 📄 Export PDF
const handleExportPDF = () => {
  if (!filteredProducts.length) {
    alert("No products to export.")
    return
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const date = new Date().toLocaleDateString()

  // ====== HEADER ======
  const img = new Image()
  img.src = "/logo.png"
  doc.addImage(img, "PNG", 40, 30, 40, 40)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("OpenStock Inventory Report", pageWidth / 2, 50, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated on: ${date}`, 40, 70)

  // ====== TABLE ======
  const tableData = filteredProducts.map((p) => [
    p.name,
    p.sku,
    p.category,
    p.quantity,
    `€${p.price?.toFixed(2)}`,
    calculateStatus(p.quantity),
  ])

  autoTable(doc, {
    startY: 90,
    head: [["Name", "SKU", "Category", "Qty", "Price", "Status"]],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5, valign: "middle" },
    headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: function (data) {
      // ====== FOOTER ======
      const pageCount = doc.internal.getNumberOfPages()
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber

      // Add footer line
      doc.setDrawColor(200)
      doc.line(40, doc.internal.pageSize.getHeight() - 40, pageWidth - 40, doc.internal.pageSize.getHeight() - 40)

      doc.setFontSize(9)
      doc.setTextColor(120)

      // Page number (right)
      doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 60, doc.internal.pageSize.getHeight() - 20, {
        align: "right",
      })

      // Footer text (left)
      doc.text("Generated by OpenStock • Lisbon, Portugal", 40, doc.internal.pageSize.getHeight() - 20)
    },
  })

  // ====== SUMMARY ======
  const finalY = doc.lastAutoTable.finalY || 90
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(`Total products: ${filteredProducts.length}`, 40, finalY + 30)

  // ====== SAVE FILE ======
  const filename = `OpenStock_Report_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(filename)
}

function handleImportCSV(e) {
  const file = e.target.files[0]
  if (!file) return

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const products = results.data
      if (!products.length) {
        toast.error("No products found in CSV")
        return
      }

      setCsvPreview(products)
      setIsPreviewOpen(true)
    },
  })
}

async function handleConfirmImport() {
  const res = await fetch("/api/products/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: csvPreview }),
  })

  if (res.ok) {
    toast.success("Products imported successfully!")
    setCsvPreview([])
    setIsPreviewOpen(false)
    window.location.reload()
  } else {
    const err = await res.json()
    toast.error(err.error || "Import failed")
  }
}


  // 🧩 UI
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
                <h1 className="text-3xl font-semibold text-foreground">Products</h1>
                <p className="mt-2 text-base text-muted-foreground">Manage your inventory products</p>
              </div>
<div className="flex items-center gap-3">
  <Button
    variant="outline"
    onClick={handleExportCSV}
    className="rounded-xl bg-white/80 dark:bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all"
  >
    Export CSV
  </Button>

  <Button
    variant="outline"
    onClick={handleExportPDF}
    className="rounded-xl bg-white/80 dark:bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all"
  >
    Export PDF
  </Button>

  <Button
  variant="outline"
  className="rounded-xl bg-white/80 dark:bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-all"
  onClick={() => document.getElementById("csvInput").click()}
>
  Import CSV
</Button>

<input
  id="csvInput"
  type="file"
  accept=".csv"
  onChange={handleImportCSV}
  className="hidden"
/>


  <Button
    className="gap-2 gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 rounded-xl px-6"
    onClick={handleAddProduct}
  >
    <Plus className="h-4 w-4" />
    Add Product
  </Button>
</div>

            </div>

            {/* Filters */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products by name, SKU, or category..."
                  className="pl-10 rounded-xl bg-white/80 dark:bg-card/80 border-border/50 shadow-sm focus-visible:shadow-md transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 bg-white/80 dark:bg-card/80 border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 rounded-full p-0 text-xs gradient-primary text-white border-0"
                      >
                        {selectedCategories.length + selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>Category</DropdownMenuLabel>
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  {statuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCategories([])
                          setSelectedStatuses([])
                        }}
                      >
                        Clear all filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <Card className="border-border/50 rounded-2xl floating-shadow">
              <CardHeader>
                <CardTitle className="text-foreground text-lg font-semibold">
                  All Products ({filteredProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-3 text-left text-sm font-semibold text-foreground">Product Name</th>
                        <th className="pb-3 text-left text-sm font-semibold text-foreground">SKU</th>
                        <th className="pb-3 text-left text-sm font-semibold text-foreground">Category</th>
                        <th className="pb-3 text-left text-sm font-semibold text-foreground">Quantity</th>
                        <th className="pb-3 text-left text-sm font-semibold text-foreground">Price</th>
                        <th className="pb-3 text-left text-sm font-semibold text-foreground">Supplier</th>
                        <th className="pb-3 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="pb-3 text-right text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                            No products found. Try adjusting your search or filters.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product, index) => (
                          <tr
                            key={product._id || index}
                            className={`border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-all duration-200 ${
                              index % 2 === 0 ? "bg-transparent" : "bg-secondary/20"
                            }`}
                          >
                            <td className="py-4 text-sm font-medium text-foreground">{product.name}</td>
                            <td className="py-4 text-sm text-muted-foreground">{product.sku}</td>
                            <td className="py-4 text-sm text-muted-foreground">{product.category}</td>
                            <td className="py-4 text-sm text-foreground font-medium">{product.quantity}</td>
                            <td className="py-4 text-sm text-foreground font-medium">€{product.price?.toFixed(2)}</td>
                            <td className="py-4 text-sm text-muted-foreground">{product.supplier?.name || "—"}</td>

                            <td className="py-4">
                              <Badge
                                variant="secondary"
                                className={`${getStatusColor(calculateStatus(product.quantity))} rounded-full px-3 py-1 font-medium`}
                              >
                                {calculateStatus(product.quantity)}
                              </Badge>
                            </td>
                            <td className="py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-secondary/80"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                  <DropdownMenuItem
                                    className="gap-2 rounded-lg"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="gap-2 text-destructive focus:text-destructive rounded-lg"
                                    onClick={() => handleDeleteProduct(product._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
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

      {/* Product Modal */}
      <ProductModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {isPreviewOpen && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full space-y-4">
      <h2 className="text-xl font-semibold">Preview CSV Import</h2>
      <p className="text-sm text-slate-600">Review the products before confirming import.</p>

      <div className="max-h-96 overflow-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {Object.keys(csvPreview[0] || {}).map((key) => (
                <th key={key} className="py-2 px-3 text-left border-b border-slate-200">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvPreview.map((row, i) => (
              <tr key={i} className="border-b hover:bg-slate-50">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="py-2 px-3">
                    {val || <span className="text-slate-400 italic">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setCsvPreview([])
            setIsPreviewOpen(false)
          }}
        >
          Cancel
        </Button>
        <Button
          className="gradient-primary text-white"
          onClick={handleConfirmImport}
        >
          Confirm Import
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  )
  
}
