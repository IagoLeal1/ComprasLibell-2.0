"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useStock, type StockItem } from "@/contexts/stock-context"
import { toast } from "@/hooks/use-toast"

interface StockFormProps {
  isOpen: boolean
  onClose: () => void
  editingItem?: StockItem | null
}

const categories = [
  "Eletrônicos",
  "Escritório",
  "Limpeza",
  "Alimentação",
  "Móveis",
  "Equipamentos",
  "Materiais",
  "Outros",
]

export function StockForm({ isOpen, onClose, editingItem }: StockFormProps) {
  const { addItem, updateItem } = useStock()
  const [formData, setFormData] = useState({
    name: editingItem?.name || "",
    category: editingItem?.category || "",
    quantity: editingItem?.quantity || 0,
    minQuantity: editingItem?.minQuantity || 0,
    supplier: editingItem?.supplier || "",
    sku: editingItem?.sku || "",
    unitValue: editingItem?.unitValue || 0,
    observation: editingItem?.observation || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do item é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória",
        variant: "destructive",
      })
      return
    }

    if (editingItem) {
      updateItem(editingItem.id, formData)
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      })
    } else {
      addItem(formData)
      toast({
        title: "Sucesso",
        description: "Item adicionado ao estoque!",
      })
    }

    setFormData({
      name: "",
      category: "",
      quantity: 0,
      minQuantity: 0,
      supplier: "",
      sku: "",
      unitValue: 0,
      observation: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#16375b] font-semibold">
            {editingItem ? "Editar Item" : "Adicionar Item ao Estoque"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#16375b] font-medium">
                Nome *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do item"
                className="border-[#8cc9cb] focus:border-[#1da7ac]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#16375b] font-medium">
                Categoria *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="border-[#8cc9cb] focus:border-[#1da7ac]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-[#16375b] font-medium">
                Quantidade
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="border-[#8cc9cb] focus:border-[#1da7ac]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity" className="text-[#16375b] font-medium">
                Qtd. Mínima
              </Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                value={formData.minQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, minQuantity: Number.parseInt(e.target.value) || 0 }))
                }
                placeholder="0"
                className="border-[#8cc9cb] focus:border-[#1da7ac]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-[#16375b] font-medium">
                Fornecedor
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData((prev) => ({ ...prev, supplier: e.target.value }))}
                placeholder="Nome do fornecedor"
                className="border-[#8cc9cb] focus:border-[#1da7ac]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku" className="text-[#16375b] font-medium">
                SKU/Código
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="Código do produto"
                className="border-[#8cc9cb] focus:border-[#1da7ac]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitValue" className="text-[#16375b] font-medium">
              Valor Unitário (R$)
            </Label>
            <Input
              id="unitValue"
              type="number"
              min="0"
              step="0.01"
              value={formData.unitValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, unitValue: Number.parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className="border-[#8cc9cb] focus:border-[#1da7ac]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation" className="text-[#16375b] font-medium">
              Observações
            </Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => setFormData((prev) => ({ ...prev, observation: e.target.value }))}
              placeholder="Observações sobre o item..."
              className="border-[#8cc9cb] focus:border-[#1da7ac] min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#8cc9cb] text-[#16375b] hover:bg-[#8cc9cb]/10 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#1da7ac] hover:bg-[#1da7ac]/90 text-white">
              {editingItem ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
