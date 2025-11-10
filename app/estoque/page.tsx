// shopping-list-app/app/estoque/page.tsx

"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { StockList } from "@/components/stock-list"
import { StockForm } from "@/components/stock-form"
import { useStock, type StockItem } from "@/contexts/stock-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, LogOut, Package, AlertTriangle, List, Users } from "lucide-react"
import { Header } from "@/components/header"
import Image from "next/image"
import Link from "next/link"

export default function StockPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | undefined>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name")

  const { items, deleteItem } = useStock()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const categories = ["all", "Recorrente", "Não Recorrente"];

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterBy === "low_stock") {
      filtered = filtered.filter((item) => item.quantity <= item.minQuantity)
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "quantity_high":
        filtered.sort((a, b) => b.quantity - a.quantity)
        break
      case "quantity_low":
        filtered.sort((a, b) => a.quantity - b.quantity)
        break
      default:
        break
    }

    return filtered
  }, [items, searchTerm, filterBy, filterCategory, sortBy])

  const itemsWithLowStock = items.filter((item) => item.quantity <= item.minQuantity).length

  const handleAddItem = () => {
    setEditingItem(undefined)
    setIsFormOpen(true)
  }

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }
  
  const handleDeleteItem = (itemId: string, itemName: string) => {
    deleteItem(itemId)
    toast({
        title: "Item Removido!",
        description: `O item "${itemName}" foi removido do estoque.`
    })
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingItem(undefined)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-libelle-light-green/15 via-libelle-light-teal/10 to-libelle-teal/5">
        <Header title="Controle de Estoque" subtitle={`Bem-vindo, ${user?.name}`} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">Itens Totais</CardTitle>
                <div className="p-2 bg-libelle-teal/10 rounded-full"><Package className="h-4 w-4 text-libelle-teal" /></div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-dark-blue">{items.length}</div>
                <p className="text-xs text-muted-foreground mt-1">tipos de itens cadastrados</p>
              </CardContent>
            </Card>
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">Itens com Estoque Baixo</CardTitle>
                <div className="p-2 bg-yellow-100 rounded-full"><AlertTriangle className="h-4 w-4 text-yellow-600" /></div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-dark-blue">{itemsWithLowStock}</div>
                <p className="text-xs text-muted-foreground mt-1">precisando de reposição</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 border-libelle-teal/20 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-libelle-teal h-4 w-4" />
                    <Input placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20" />
                  </div>
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-full sm:w-48 border-libelle-teal/20 focus:ring-libelle-teal focus:border-libelle-teal">
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os itens</SelectItem>
                      <SelectItem value="low_stock">Estoque baixo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-48 border-libelle-teal/20 focus:ring-libelle-teal focus:border-libelle-teal">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "Todas as categorias" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 border-libelle-teal/20 focus:ring-libelle-teal focus:border-libelle-teal">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome (A-Z)</SelectItem>
                      <SelectItem value="quantity_high">Maior quantidade</SelectItem>
                      <SelectItem value="quantity_low">Menor quantidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddItem} className="bg-libelle-teal hover:bg-libelle-teal/90 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <StockList items={filteredAndSortedItems} onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-libelle-teal/20">
              <DialogHeader>
                <DialogTitle className="sr-only">{editingItem ? "Editar Item" : "Adicionar Item"}</DialogTitle>
              </DialogHeader>
              <StockForm item={editingItem} onClose={handleCloseForm} />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}