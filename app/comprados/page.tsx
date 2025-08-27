// shopping-list-app/app/comprados/page.tsx

"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { ProductList } from "@/components/product-list"
import { useProducts, type Product } from "@/contexts/products-context"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, ShoppingCart, List, CheckSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function PurchasedPage() {
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  const { getProductsByUser } = useProducts()
  const { user, logout } = useAuth()

  const userProducts = user ? getProductsByUser(user.id) : []

  // Filtra para mostrar APENAS os produtos comprados
  const purchasedProducts = useMemo(() => {
    return userProducts.filter(product => product.wasPurchased === true)
  }, [userProducts])

  // Calcula o valor total dos itens comprados
  const totalPurchasedValue = purchasedProducts.reduce((sum, product) => sum + product.value, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }
  
  // A função de edição não é necessária aqui, mas passamos para a ProductList
  const handleEditProduct = (product: Product) => {
    // A edição ainda abrirá o modal na lista de comprados, o que é útil
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
                  <h1 className="text-xl font-bold text-libelle-dark-blue">Itens Comprados</h1>
                  <p className="text-sm text-libelle-teal">Histórico de compras</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white transition-all duration-200 bg-transparent"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Lista de Compras
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">Total de Itens Comprados</CardTitle>
                <div className="p-2 bg-libelle-teal/10 rounded-full">
                  <CheckSquare className="h-4 w-4 text-libelle-teal" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-dark-blue">{purchasedProducts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">produtos no histórico</p>
              </CardContent>
            </Card>
            <Card className="border-libelle-teal/20 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm py-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
                <CardTitle className="text-sm font-medium text-libelle-dark-blue">Valor Total Gasto</CardTitle>
                <div className="p-2 bg-libelle-orange/10 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-libelle-orange" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-2">
                <div className="text-2xl font-bold text-libelle-teal">{formatCurrency(totalPurchasedValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">valor total dos itens comprados</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Reutilizamos o mesmo componente de lista */}
          <ProductList products={purchasedProducts} onEditProduct={handleEditProduct} />
        </main>
      </div>
    </ProtectedRoute>
  )
}