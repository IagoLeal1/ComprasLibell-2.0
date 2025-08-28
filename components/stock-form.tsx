"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStock, type StockItem } from "@/contexts/stock-context"
import { useToast } from "@/hooks/use-toast"
import { Package, FileText, Hash } from "lucide-react"

export interface StockFormProps {
  item?: StockItem
  onClose: () => void
}

export function StockForm({ item, onClose }: StockFormProps) {
  // ALTERAÇÃO: Mantidos apenas os 3 states necessários
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [observation, setObservation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { addItem, updateItem } = useStock()
  const { toast } = useToast()

  useEffect(() => {
    if (item) {
      setName(item.name || "")
      setQuantity(item.quantity?.toString() || "0")
      setObservation(item.observation || "")
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ALTERAÇÃO: Objeto de dados com apenas 3 campos
      const itemData = {
        name,
        quantity: Number.parseInt(quantity) || 0,
        observation,
      }

      if (item) {
        await updateItem(item.id, itemData)
        toast({
          title: "Item atualizado!",
          description: "O item do estoque foi atualizado com sucesso.",
        })
      } else {
        await addItem(itemData)
        toast({
          title: "Item adicionado!",
          description: "O novo item foi adicionado ao estoque.",
        })
      }
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o item.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-libelle-teal/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-libelle-teal/5 to-libelle-light-green/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-libelle-teal/10 rounded-full">
            <Package className="h-5 w-5 text-libelle-teal" />
          </div>
          <CardTitle className="text-libelle-dark-blue">{item ? "Editar Item" : "Adicionar Item ao Estoque"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* ALTERAÇÃO: Formulário simplificado */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
              <Package className="h-4 w-4 text-libelle-teal" />
              <span>Nome do Item *</span>
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
              <Hash className="h-4 w-4 text-libelle-teal" />
              <span>Quantidade Inicial *</span>
            </Label>
            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
              <FileText className="h-4 w-4 text-libelle-teal" />
              <span>Observações</span>
            </Label>
            <Textarea id="observation" value={observation} onChange={(e) => setObservation(e.target.value)} rows={3} placeholder="Detalhes adicionais sobre o item..." />
          </div>

          <div className="flex gap-3 pt-4 border-t border-libelle-teal/10">
            <Button type="submit" className="bg-libelle-teal hover:bg-libelle-teal/90 text-white" disabled={isLoading}>
              {isLoading ? "Salvando..." : item ? "Atualizar Item" : "Adicionar Item"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white bg-transparent">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}