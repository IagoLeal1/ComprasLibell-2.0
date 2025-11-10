"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupplies, type Supply } from "@/contexts/supplies-context" // Caminho atualizado
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Package, AlertCircle, FileText, DollarSign } from "lucide-react"

interface SupplyFormProps {
  supply?: Supply
  onClose: () => void
}

const priorities = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
]

export function SupplyForm({ supply, onClose }: SupplyFormProps) {
  const [name, setName] = useState(supply?.name || "")
  const [priority, setPriority] = useState(supply?.priority || "low") // Padrão 'low'
  const [value, setValue] = useState(supply?.value?.toString() || "")
  const [observation, setObservation] = useState(supply?.observation || "")
  const [isLoading, setIsLoading] = useState(false)

  const { addSupply, updateSupply } = useSupplies()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      // Este objeto corresponde ao tipo NewSupplyData no context
      const supplyData = {
        name,
        priority: (priority as "low" | "medium" | "high") || "low",
        value: Number.parseFloat(value) || 0,
        observation,
      }

      if (supply) {
        // O update aceita um objeto parcial
        await updateSupply(supply.id, supplyData) // Adicionado await
        toast({
          title: "Suprimento atualizado!",
          description: "O suprimento foi atualizado com sucesso.",
        })
      } else {
        await addSupply(supplyData) // Adicionado await
        toast({
          title: "Suprimento adicionado!",
          description: "O suprimento foi adicionado à lista com sucesso.",
        })
      }

      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o suprimento.",
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
          <CardTitle className="text-libelle-dark-blue">
            {supply ? "Editar Suprimento" : "Adicionar Suprimento"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="flex items-center space-x-2 text-libelle-dark-blue font-medium"
            >
              <Package className="h-4 w-4 text-libelle-teal" />
              <span>Nome do Suprimento *</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Canetas esferográficas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="priority"
                className="flex items-center space-x-2 text-libelle-dark-blue font-medium"
              >
                <AlertCircle className="h-4 w-4 text-libelle-teal" />
                <span>Prioridade *</span>
              </Label>
              <Select
                value={priority}
                onValueChange={(v) =>
                  setPriority(v as "low" | "medium" | "high")
                }
                required
              >
                <SelectTrigger className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20">
                  <SelectValue placeholder="Selecione uma prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((prio) => (
                    <SelectItem key={prio.value} value={prio.value}>
                      {prio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="value"
                className="flex items-center space-x-2 text-libelle-dark-blue font-medium"
              >
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
            <Label
              htmlFor="observation"
              className="flex items-center space-x-2 text-libelle-dark-blue font-medium"
            >
              <FileText className="h-4 w-4 text-libelle-teal" />
              <span>Observações</span>
            </Label>
            <Textarea
              id="observation"
              placeholder="Observações adicionais sobre o suprimento..."
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
              {isLoading ? "Salvando..." : supply ? "Atualizar" : "Adicionar"}
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