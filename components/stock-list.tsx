"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Package, AlertTriangle, ShoppingCart, CheckCircle } from "lucide-react"
import { useStock, type StockItem } from "@/contexts/stock-context"
import { StockForm } from "./stock-form"
import { toast } from "@/hooks/use-toast"

interface StockListProps {
  items: StockItem[]
}

export function StockList({ items }: StockListProps) {
  const { updateItem, deleteItem } = useStock()
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (item: StockItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}" do estoque?`)) {
      deleteItem(id)
      toast({
        title: "Item excluído",
        description: "Item removido do estoque com sucesso!",
      })
    }
  }

  const handleNeedsToBuyChange = (itemId: string, checked: boolean) => {
    updateItem(itemId, { needsToBuy: checked })
    toast({
      title: checked ? "Marcado para comprar" : "Desmarcado para comprar",
      description: checked ? "Item adicionado à lista de compras." : "Item removido da lista de compras.",
    })
  }

  const handleWasPurchasedChange = (itemId: string, checked: boolean) => {
    updateItem(itemId, { wasPurchased: checked })
    toast({
      title: checked ? "Marcado como comprado" : "Desmarcado como comprado",
      description: checked ? "Item marcado como comprado." : "Item desmarcado como comprado.",
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
      Eletrônicos: "bg-blue-100 text-blue-800 border-blue-200",
      Escritório: "bg-gray-100 text-gray-800 border-gray-200",
      Limpeza: "bg-green-100 text-green-800 border-green-200",
      Alimentação: "bg-orange-100 text-orange-800 border-orange-200",
      Móveis: "bg-purple-100 text-purple-800 border-purple-200",
      Equipamentos: "bg-red-100 text-red-800 border-red-200",
      Materiais: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Outros: "bg-slate-100 text-slate-800 border-slate-200",
    }
    return colors[category] || colors["Outros"]
  }

  const isLowStock = (item: StockItem) => {
    return item.quantity <= item.minQuantity && item.minQuantity > 0
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border border-[#8cc9cb]/30 rounded-lg">
        <Package className="mx-auto h-12 w-12 text-[#8cc9cb] mb-4" />
        <h3 className="text-lg font-medium text-[#16375b] mb-2">Nenhum item no estoque</h3>
        <p className="text-[#8cc9cb] mb-4">Comece adicionando itens ao seu estoque.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-[#8cc9cb]/30 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1da7ac]/5">
              <TableHead className="w-12">
                <ShoppingCart className="h-4 w-4 text-[#1da7ac]" />
              </TableHead>
              <TableHead className="w-12">
                <CheckCircle className="h-4 w-4 text-[#1da7ac]" />
              </TableHead>
              <TableHead className="text-[#16375b] font-semibold">Item</TableHead>
              <TableHead className="text-[#16375b] font-semibold">Categoria</TableHead>
              <TableHead className="text-[#16375b] font-semibold">Quantidade</TableHead>
              <TableHead className="text-[#16375b] font-semibold">Fornecedor</TableHead>
              <TableHead className="text-[#16375b] font-semibold">SKU</TableHead>
              <TableHead className="text-[#16375b] font-semibold">Valor Unit.</TableHead>
              <TableHead className="text-[#16375b] font-semibold">Valor Total</TableHead>
              <TableHead className="text-[#16375b] font-semibold w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-[#1da7ac]/5 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={item.needsToBuy || false}
                    onCheckedChange={(checked) => handleNeedsToBuyChange(item.id, checked as boolean)}
                    className="data-[state=checked]:bg-[#1da7ac] data-[state=checked]:border-[#1da7ac]"
                    title="Lembrar de comprar"
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={item.wasPurchased || false}
                    onCheckedChange={(checked) => handleWasPurchasedChange(item.id, checked as boolean)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    title="Foi comprado"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#16375b]">{item.name}</span>
                    {isLowStock(item) && <AlertTriangle className="h-4 w-4 text-red-500" title="Estoque baixo" />}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${isLowStock(item) ? "text-red-600" : "text-[#16375b]"}`}>
                      {item.quantity}
                    </span>
                    {item.minQuantity > 0 && <span className="text-xs text-[#8cc9cb]">/ min: {item.minQuantity}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-[#16375b]">{item.supplier || "-"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-[#16375b]">{item.sku || "-"}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-[#16375b]">{formatCurrency(item.unitValue)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-[#1da7ac]">{formatCurrency(item.unitValue * item.quantity)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0 text-[#1da7ac] hover:bg-[#1da7ac]/10"
                      title="Editar item"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                      title="Excluir item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StockForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingItem(null)
        }}
        editingItem={editingItem}
      />
    </>
  )
}
