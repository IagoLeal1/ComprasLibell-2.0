"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useProducts, type Product } from "@/contexts/products-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, ExternalLink, Package, ShoppingCart, CheckCircle } from "lucide-react"

interface ProductListProps {
  products: Product[]
  onEditProduct: (product: Product) => void
}

export function ProductList({ products, onEditProduct }: ProductListProps) {
  const { updateProduct, deleteProduct } = useProducts()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleDeleteProduct = (productId: string, productName: string) => {
    deleteProduct(productId)
    toast({
      title: "Produto removido!",
      description: `${productName} foi removido da lista.`,
    })
  }

  const handleNeedsToBuyChange = (productId: string, checked: boolean) => {
    updateProduct(productId, { needsToBuy: checked })
    toast({
      title: checked ? "Marcado para comprar" : "Desmarcado para comprar",
      description: checked ? "Produto adicionado à lista de compras." : "Produto removido da lista de compras.",
    })
  }

  const handleWasPurchasedChange = (productId: string, checked: boolean) => {
    updateProduct(productId, { wasPurchased: checked })
    toast({
      title: checked ? "Marcado como comprado" : "Desmarcado como comprado",
      description: checked ? "Produto marcado como comprado." : "Produto desmarcado como comprado.",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Escritório: "border-transparent bg-blue-50 text-blue-700 border-blue-200",
      Limpeza: "border-transparent bg-libelle-light-green text-libelle-dark-blue",
      Alimentação: "border-transparent bg-orange-50 text-orange-700 border-orange-200",
      Tecnologia: "border-transparent bg-purple-50 text-purple-700 border-purple-200",
      Móveis: "border-transparent bg-yellow-50 text-yellow-700 border-yellow-200",
      Equipamentos: "border-transparent bg-libelle-coral/20 text-libelle-red",
      Materiais: "border-transparent bg-gray-50 text-gray-700 border-gray-200",
      Outros: "border-transparent bg-libelle-teal/20 text-libelle-teal",
    }
    return colors[category] || "border-transparent bg-gray-50 text-gray-700"
  }

  if (products.length === 0) {
    return (
      <div className="border border-libelle-teal/20 rounded-lg p-16 text-center">
        <div className="w-16 h-16 bg-libelle-light-green/30 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Package className="h-8 w-8 text-libelle-teal" />
        </div>
        <h3 className="text-xl font-semibold text-libelle-dark-blue mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Adicione produtos à sua lista de compras para começar a organizar suas compras empresariais.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-libelle-teal/20 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-libelle-teal/5">
            <TableHead className="w-12">
              <ShoppingCart className="h-4 w-4 text-libelle-teal" />
            </TableHead>
            <TableHead className="w-12">
              <CheckCircle className="h-4 w-4 text-libelle-teal" />
            </TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Produto</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Categoria</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Valor</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Observação</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-libelle-teal/5 transition-colors">
              <TableCell>
                <Checkbox
                  checked={product.needsToBuy || false}
                  onCheckedChange={(checked) => handleNeedsToBuyChange(product.id, checked as boolean)}
                  className="data-[state=checked]:bg-libelle-teal data-[state=checked]:border-libelle-teal"
                  title="Lembrar de comprar"
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={product.wasPurchased || false}
                  onCheckedChange={(checked) => handleWasPurchasedChange(product.id, checked as boolean)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  title="Foi comprado"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-libelle-dark-blue">{product.name}</span>
                  {product.link && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-libelle-teal hover:bg-libelle-teal/10"
                      onClick={() => window.open(product.link, "_blank")}
                      title="Ver produto"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getCategoryColor(product.category)} variant="secondary">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-libelle-teal">{formatCurrency(product.value)}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                  {product.observation || "-"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditProduct(product)}
                    className="h-8 w-8 p-0 hover:bg-libelle-teal/10 hover:text-libelle-teal"
                    title="Editar produto"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        title="Excluir produto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover "{product.name}" da lista? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
