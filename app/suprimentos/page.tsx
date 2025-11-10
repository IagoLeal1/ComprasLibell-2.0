"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { SupplyForm } from "@/components/supply-form" // Verifique se este caminho está correto
import { SupplyList } from "@/components/supply-list" // Verifique se este caminho está correto
import { useSupplies, type Supply } from "@/contexts/supplies-context" // Caminho atualizado
import { useAuth } from "@/contexts/auth-context"
import {
  Plus,
  Search,
  LogOut,
  ShoppingCart,
  TrendingUp,
  Filter,
  Package,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"

export default function SuppliesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupply, setEditingSupply] = useState<Supply | undefined>()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  // Atualizado para pegar 'supplies' e 'isLoading'
  const { supplies, isLoading } = useSupplies()
  const { user, logout } = useAuth()

  const filteredAndSortedSupplies = useMemo(() => {
    let filtered = supplies // Usa 'supplies' diretamente

    if (searchTerm) {
      filtered = filtered.filter(
        (supply) =>
          supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supply.observation.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(
        (supply) => supply.priority === selectedPriority,
      )
    }

    switch (sortBy) {
      case "newest":
        // Compara como Date
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case "oldest":
        // Compara como Date
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
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
  }, [supplies, searchTerm, selectedPriority, sortBy])

  const totalValue = supplies.reduce((sum, supply) => sum + supply.value, 0)
  const purchasedCount = supplies.filter((s) => s.isPurchased).length

  const handleAddSupply = () => {
    setEditingSupply(undefined)
    setIsFormOpen(true)
  }

  const handleEditSupply = (supply: Supply) => {
    setEditingSupply(supply)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingSupply(undefined)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Calcula o valor a comprar (apenas itens não comprados)
  const valueToBuy = supplies
    .filter((s) => !s.isPurchased)
    .reduce((sum, supply) => sum + supply.value, 0)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-libelle-light-green/15 via-libelle-light-teal/10 to-libelle-teal/5">
        {/* Header */}
        <Header title="Lista de Suprimentos" subtitle={`Bem-vindo, ${user?.name}`} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">
                  Total de Suprimentos
                </CardTitle>
                <div className="p-2 bg-libelle-teal/10 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-libelle-teal" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-dark-blue">
                  {supplies.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  suprimentos cadastrados
                </p>
              </CardContent>
            </Card>
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">
                  Valor a Comprar
                </CardTitle>
                <div className="p-2 bg-libelle-orange/10 rounded-full">
                  <TrendingUp className="h-4 w-4 text-libelle-orange" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-teal">
                  {formatCurrency(valueToBuy)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  valor estimado a comprar
                </p>
              </CardContent>
            </Card>
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">
                  Suprimentos Filtrados
                </CardTitle>
                <div className="p-2 bg-libelle-light-green/30 rounded-full">
                  <Filter className="h-4 w-4 text-libelle-green" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-dark-blue">
                  {filteredAndSortedSupplies.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  na visualização atual
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters Card */}
          <Card className="mb-8 border-libelle-teal/20 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-libelle-teal h-4 w-4" />
                    <Input
                      placeholder="Buscar suprimentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
                    />
                  </div>
                  <Select
                    value={selectedPriority}
                    onValueChange={setSelectedPriority}
                  >
                    <SelectTrigger className="w-full sm:w-48 border-libelle-teal/20 focus:ring-libelle-teal focus:border-libelle-teal">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as prioridades</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
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
                  onClick={handleAddSupply}
                  className="bg-libelle-teal hover:bg-libelle-teal/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Suprimento
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supply List */}
          {isLoading ? (
            <div className="text-center py-10">Carregando suprimentos...</div>
          ) : (
            <SupplyList
              supplies={filteredAndSortedSupplies}
              onEditSupply={handleEditSupply}
            />
          )}

          {/* Form Modal */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-libelle-teal/20">
              <DialogHeader>
                <DialogTitle className="sr-only">
                  {editingSupply
                    ? "Editar Suprimento"
                    : "Adicionar Suprimento"}
                </DialogTitle>
              </DialogHeader>
              <SupplyForm supply={editingSupply} onClose={handleCloseForm} />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}