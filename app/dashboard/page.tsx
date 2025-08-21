"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { ProductForm } from "@/components/product-form"
import { ProductList } from "@/components/product-list"
import { useProducts, type Product } from "@/contexts/products-context"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Search, LogOut, ShoppingCart, TrendingUp, Filter, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  const { getProductsByUser } = useProducts()
  const { user, logout } = useAuth()

  const userProducts = user ? getProductsByUser(user.id) : []

  // ALTERAÇÃO: Array de prioridades para o filtro
  const priorities = ["all", "Alta", "Média", "Baixa"]

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = userProducts

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.priority && product.priority.toLowerCase().includes(searchTerm.toLowerCase())) || // Checagem de segurança
          product.observation.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // ALTERAÇÃO: Filtrando por prioridade
    if (selectedPriority !== "all") {
      filtered = filtered.filter((product) => product.priority === selectedPriority)
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "price-high":
        filtered.sort((a, b) => b.value - a.value)
        break
      case "price-low":
        filtered.sort((a, b) => a.value - b.value)
        break
      default:
        break
    }

    return filtered
  }, [userProducts, searchTerm, selectedPriority, sortBy])

  const totalValue = userProducts.reduce((sum, product) => sum + product.value, 0)

  const handleAddProduct = () => {
    setEditingProduct(undefined)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProduct(undefined)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-libelle-light-green/15 via-libelle-light-teal/10 to-libelle-teal/5">
        <header className="bg-white/95 backdrop-blur-sm border-b border-libelle-teal/20 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="p-2">
                  <Image
                    src="/images/casa-libelle-logo.png"
                    alt="Casa Libelle Logo"
                    width={80}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-libelle-dark-blue">Lista de Compras</h1>
                  <p className="text-sm text-libelle-teal">Bem-vindo, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/estoque">
                  <Button
                    variant="outline"
                    className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white transition-all duration-200 bg-transparent"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Estoque
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white transition-all duration-200 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">Total de Produtos</CardTitle>
                <div className="p-2 bg-libelle-teal/10 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-libelle-teal" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-dark-blue">{userProducts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">produtos cadastrados</p>
              </CardContent>
            </Card>
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">Valor Total</CardTitle>
                <div className="p-2 bg-libelle-orange/10 rounded-full">
                  <TrendingUp className="h-4 w-4 text-libelle-orange" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-teal">{formatCurrency(totalValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">valor estimado</p>
              </CardContent>
            </Card>
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">Produtos Filtrados</CardTitle>
                <div className="p-2 bg-libelle-light-green/30 rounded-full">
                  <Filter className="h-4 w-4 text-libelle-green" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-dark-blue">{filteredAndSortedProducts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">na visualização atual</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 border-libelle-teal/20 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-libelle-teal h-4 w-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
                    />
                  </div>
                  {/* ALTERAÇÃO: Filtro de Categoria para Prioridade */}
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-full sm:w-48 border-libelle-teal/20 focus:ring-libelle-teal focus:border-libelle-teal">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority === "all" ? "Todas as prioridades" : priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 border-libelle-teal/20 focus:ring-libelle-teal focus:border-libelle-teal">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais recentes</SelectItem>
                      <SelectItem value="oldest">Mais antigos</SelectItem>
                      <SelectItem value="name">Nome (A-Z)</SelectItem>
                      <SelectItem value="price-high">Maior preço</SelectItem>
                      <SelectItem value="price-low">Menor preço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddProduct}
                  className="bg-libelle-teal hover:bg-libelle-teal/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            </CardContent>
          </Card>

          <ProductList products={filteredAndSortedProducts} onEditProduct={handleEditProduct} />

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-libelle-teal/20">
              <DialogHeader>
                <DialogTitle className="sr-only">{editingProduct ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
              </DialogHeader>
              <ProductForm product={editingProduct} onClose={handleCloseForm} />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}