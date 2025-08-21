"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts, type Product } from "@/contexts/products-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Package, Tag, LinkIcon, FileText, DollarSign } from "lucide-react"

interface ProductFormProps {
  product?: Product
  onClose: () => void
}

const categories = [
  "Escritório",
  "Limpeza",
  "Alimentação",
  "Tecnologia",
  "Móveis",
  "Equipamentos",
  "Materiais",
  "Outros",
]

export function ProductForm({ product, onClose }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [category, setCategory] = useState(product?.category || "")
  const [link, setLink] = useState(product?.link || "")
  const [observation, setObservation] = useState(product?.observation || "")
  const [value, setValue] = useState(product?.value?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)

  const { addProduct, updateProduct } = useProducts()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const productData = {
        name,
        category,
        link,
        observation,
        value: Number.parseFloat(value) || 0,
        userId: user.id,
      }

      if (product) {
        updateProduct(product.id, productData)
        toast({
          title: "Produto atualizado!",
          description: "O produto foi atualizado com sucesso.",
        })
      } else {
        addProduct(productData)
        toast({
          title: "Produto adicionado!",
          description: "O produto foi adicionado à lista com sucesso.",
        })
      }

      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-libelle-teal/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-libelle-teal/5 to-libelle-light-green/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-libelle-teal/10 rounded-full">
            <Package className="h-5 w-5 text-libelle-teal" />
          </div>
          <CardTitle className="text-libelle-dark-blue">{product ? "Editar Produto" : "Adicionar Produto"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
                <Package className="h-4 w-4 text-libelle-teal" />
                <span>Nome do Produto *</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Papel A4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
                <Tag className="h-4 w-4 text-libelle-teal" />
                <span>Categoria *</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="link" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
                <LinkIcon className="h-4 w-4 text-libelle-teal" />
                <span>Link do Produto</span>
              </Label>
              <Input
                id="link"
                type="url"
                placeholder="https://exemplo.com/produto"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
                <DollarSign className="h-4 w-4 text-libelle-teal" />
                <span>Valor (R$) *</span>
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
              <FileText className="h-4 w-4 text-libelle-teal" />
              <span>Observações</span>
            </Label>
            <Textarea
              id="observation"
              placeholder="Observações adicionais sobre o produto..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-libelle-teal/10">
            <Button
              type="submit"
              className="bg-libelle-teal hover:bg-libelle-teal/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : product ? "Atualizar" : "Adicionar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
