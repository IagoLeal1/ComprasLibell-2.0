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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts, type Product } from "@/contexts/products-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, ExternalLink, Package, CheckCircle } from "lucide-react"

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

  const handleWasPurchasedChange = (productId: string, checked: boolean) => {
    updateProduct(productId, { wasPurchased: checked })
    toast({
      title: checked ? "Marcado como comprado" : "Desmarcado como comprado",
      description: checked ? "Produto marcado como comprado." : "Produto desmarcado como comprado.",
    })
  }
  
  // ALTERAÇÃO: Tipo atualizado para incluir "none"
  const handleStatusChange = (productId: string, status: "none" | "pending" | "approved" | "rejected") => {
    updateProduct(productId, { status })
    // ALTERAÇÃO: Adicionado label para "none"
    const statusLabels = { none: "Sem Status", pending: "Aguardando", approved: "Aprovado", rejected: "Negado" }
    toast({
      title: "Status atualizado",
      description: `Produto marcado como ${statusLabels[status]}.`,
    })
  }

  const handlePaymentChange = (productId: string, paymentType: "cash" | "installments", installments?: number) => {
    updateProduct(productId, { paymentType, installments })
    toast({
      title: "Forma de pagamento atualizada",
      description: paymentType === "cash" ? "Pagamento à vista" : `Parcelado em ${installments}x`,
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
              <CheckCircle className="h-4 w-4 text-libelle-teal" />
            </TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Produto</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Categoria</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Status</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Pagamento</TableHead>
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
                {/* ALTERAÇÃO: O value padrão agora é "none" */}
                <Select
                  value={product.status || "none"}
                  onValueChange={(value) =>
                    handleStatusChange(product.id, value as "none" | "pending" | "approved" | "rejected")
                  }
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* ALTERAÇÃO: Adicionado o item "Sem Status" */}
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        Sem Status
                      </div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Aguardando
                      </div>
                    </SelectItem>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Aprovado
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Negado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Select
                    value={product.paymentType || "cash"}
                    onValueChange={(value) => {
                      if (value === "cash") {
                        handlePaymentChange(product.id, "cash", undefined)
                      } else {
                        handlePaymentChange(product.id, "installments", product.installments || 2)
                      }
                    }}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">À vista</SelectItem>
                      <SelectItem value="installments">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                  {product.paymentType === "installments" && (
                    <Select
                      value={product.installments?.toString() || "2"}
                      onValueChange={(value) => handlePaymentChange(product.id, "installments", Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
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