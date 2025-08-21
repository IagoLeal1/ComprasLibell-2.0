"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Package, AlertTriangle, TrendingUp, LogOut } from "lucide-react"
import { useStock } from "@/contexts/stock-context"
import { useAuth } from "@/contexts/auth-context"
import { StockForm } from "@/components/stock-form"
import { StockList } from "@/components/stock-list"
import { ProtectedRoute } from "@/components/protected-route"
import Image from "next/image"
import Link from "next/link"

function StockPage() {
  const { items } = useStock()
  const { user, logout } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const categories = [
    "all",
    "Eletrônicos",
    "Escritório",
    "Limpeza",
    "Alimentação",
    "Móveis",
    "Equipamentos",
    "Materiais",
    "Outros",
  ]

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "quantity":
          return b.quantity - a.quantity
        case "value":
          return b.unitValue * b.quantity - a.unitValue * a.quantity
        case "category":
          return a.category.localeCompare(b.category)
        case "lowStock":
          const aLowStock = a.quantity <= a.minQuantity && a.minQuantity > 0
          const bLowStock = b.quantity <= b.minQuantity && b.minQuantity > 0
          if (aLowStock && !bLowStock) return -1
          if (!aLowStock && bLowStock) return 1
          return 0
        default:
          return 0
      }
    })
  }, [items, searchTerm, selectedCategory, sortBy])

  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + item.unitValue * item.quantity, 0)
  const lowStockItems = items.filter((item) => item.quantity <= item.minQuantity && item.minQuantity > 0).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#87d1af]/10 via-white to-[#8cc9cb]/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <Image
                src="/images/casa-libelle-logo.png"
                alt="Casa Libelle"
                width={60}
                height={60}
                className="rounded-lg"
              />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#16375b]">Controle de Estoque</h1>
              <p className="text-[#8cc9cb]">Olá, {user?.name}! Gerencie seu estoque aqui.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-[#8cc9cb] text-[#16375b] hover:bg-[#8cc9cb]/10 bg-transparent"
              >
                <Package className="w-4 h-4 mr-2" />
                Lista de Compras
              </Button>
            </Link>
            <Button
              onClick={logout}
              variant="outline"
              className="border-[#8cc9cb] text-[#16375b] hover:bg-[#8cc9cb]/10 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#8cc9cb]/30 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#8cc9cb]">Total de Itens</CardTitle>
              <Package className="h-4 w-4 text-[#1da7ac]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#16375b]">{totalItems}</div>
              <p className="text-xs text-[#8cc9cb]">itens cadastrados</p>
            </CardContent>
          </Card>

          <Card className="border-[#8cc9cb]/30 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#8cc9cb]">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#1da7ac]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#16375b]">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-[#8cc9cb]">valor do estoque</p>
            </CardContent>
          </Card>

          <Card className="border-[#8cc9cb]/30 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#8cc9cb]">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
              <p className="text-xs text-[#8cc9cb]">itens com estoque baixo</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8cc9cb] h-4 w-4" />
              <Input
                placeholder="Buscar por nome, fornecedor ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#8cc9cb] focus:border-[#1da7ac]"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] border-[#8cc9cb] focus:border-[#1da7ac]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px] border-[#8cc9cb] focus:border-[#1da7ac]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="quantity">Quantidade</SelectItem>
                <SelectItem value="value">Valor Total</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="lowStock">Estoque Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setIsFormOpen(true)} className="bg-[#1da7ac] hover:bg-[#1da7ac]/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {/* Items List */}
        <StockList items={filteredAndSortedItems} />

        {/* Add/Edit Form */}
        <StockForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      </div>
    </div>
  )
}

export default function EstoquePage() {
  return (
    <ProtectedRoute>
      <StockPage />
    </ProtectedRoute>
  )
}
