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
    })
  }
  
  const handleStatusChange = (productId: string, status: "none" | "pending" | "approved" | "rejected") => {
    updateProduct(productId, { status })
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

  // ALTERAÇÃO: Função para cores da prioridade
  const getPriorityColor = (priority: string) => {
    const colors = {
      Baixa: "border-transparent bg-blue-100 text-blue-800",
      Média: "border-transparent bg-yellow-100 text-yellow-800",
      Alta: "border-transparent bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || "border-transparent bg-gray-100 text-gray-800"
  }

  if (products.length === 0) {
    return (
      <div className="border border-libelle-teal/20 rounded-lg p-16 text-center">
        <div className="w-16 h-16 bg-libelle-light-green/30 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Package className="h-8 w-8 text-libelle-teal" />
        </div>
        <h3 className="text-xl font-semibold text-libelle-dark-blue mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Adicione produtos à sua lista de compras para começar a organizar suas compras.
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
            {/* ALTERAÇÃO: Cabeçalho de Categoria para Prioridade */}
            <TableHead className="text-libelle-dark-blue font-semibold">Prioridade</TableHead>
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
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-libelle-teal hover:bg-libelle-teal/10" onClick={() => window.open(product.link, "_blank")} title="Ver produto">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              {/* ALTERAÇÃO: Célula de Categoria para Prioridade */}
              <TableCell>
                <Badge className={getPriorityColor(product.priority)} variant="secondary">
                  {product.priority}
                </Badge>
              </TableCell>
              <TableCell>
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
                    <SelectItem value="none">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"></div>Sem Status</div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Aguardando</div>
                    </SelectItem>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>Aprovado</div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div>Negado</div>
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
                    <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
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
                      <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => (<SelectItem key={num} value={num.toString()}>{num}x</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-libelle-teal">{formatCurrency(product.value)}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{product.observation || "-"}</span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onEditProduct(product)} className="h-8 w-8 p-0 hover:bg-libelle-teal/10 hover:text-libelle-teal" title="Editar produto">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" title="Excluir produto">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>Tem certeza que deseja remover "{product.name}" da lista? Esta ação não pode ser desfeita.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id, product.name)} className="bg-red-500 hover:bg-red-600">Remover</AlertDialogAction>
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