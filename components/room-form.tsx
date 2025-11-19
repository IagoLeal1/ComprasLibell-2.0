"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRooms, type Room, type RoomItem } from "@/contexts/rooms-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LayoutDashboard, Plus, X, ListPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RoomFormProps {
  room?: Room
  onClose: () => void
}

export function RoomForm({ room, onClose }: RoomFormProps) {
  const [name, setName] = useState(room?.name || "")
  const [itemInput, setItemInput] = useState("")
  // Alterado para string vazia para incentivar a digitação, ou use "Geral" como padrão
  const [itemCategory, setItemCategory] = useState("") 
  const [items, setItems] = useState<RoomItem[]>(room?.items || [])
  const [isLoading, setIsLoading] = useState(false)

  const { addRoom, updateRoom } = useRooms()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleAddItem = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault()
    
    if (itemInput.trim()) {
      // Garante que tenha uma categoria, se estiver vazio usa "Geral"
      const categoryToUse = itemCategory.trim() || "Geral"
      setItems([...items, { name: itemInput.trim(), category: categoryToUse }])
      setItemInput("")
      // Opcional: Limpar a categoria após adicionar ou manter a última digitada
      // setItemCategory("") 
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!name.trim()) {
       toast({ title: "Erro", description: "Nome da sala é obrigatório", variant: "destructive" })
       return
    }

    setIsLoading(true)

    try {
      if (room) {
        await updateRoom(room.id, { name, items })
        toast({
          title: "Sala atualizada!",
          description: "A sala foi atualizada com sucesso.",
        })
      } else {
        await addRoom(name, items)
        toast({
          title: "Sala adicionada!",
          description: "A sala foi adicionada com sucesso.",
        })
      }

      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a sala.",
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
            <LayoutDashboard className="h-5 w-5 text-libelle-teal" />
          </div>
          <CardTitle className="text-libelle-dark-blue">{room ? "Editar Sala" : "Adicionar Sala"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
              <LayoutDashboard className="h-4 w-4 text-libelle-teal" />
              <span>Nome da Sala *</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Sala 1, Recepção..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemInput" className="flex items-center space-x-2 text-libelle-dark-blue font-medium">
              <ListPlus className="h-4 w-4 text-libelle-teal" />
              <span>Adicionar Item à Lista</span>
            </Label>
            
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="flex-1">
                <Input
                  id="itemInput"
                  type="text"
                  placeholder="Nome do item..."
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
                />
              </div>
              
              {/* Campo de Categoria agora é um Input livre */}
              <div className="w-full sm:w-40">
                <Input
                  placeholder="Categoria"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  onKeyDown={handleKeyDown} // Permite adicionar com Enter aqui também
                  className="focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
                />
              </div>

              <Button 
                type="button" 
                onClick={(e) => handleAddItem(e)}
                className="bg-libelle-teal hover:bg-libelle-teal/90 text-white sm:w-auto w-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Lista de Itens Adicionados */}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 min-h-[100px]">
                <p className="text-xs text-muted-foreground mb-2">Itens nesta sala:</p>
                <div className="flex flex-wrap gap-2">
                    {items.length === 0 && <span className="text-sm text-gray-400 italic">Nenhum item adicionado.</span>}
                    {items.map((item, index) => (
                        <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 bg-white border-libelle-teal/30 text-libelle-dark-blue flex items-center gap-1">
                            <span className="font-normal text-libelle-teal text-[10px] mr-1 border-r border-gray-200 pr-1">{item.category}</span>
                            {item.name}
                            <button 
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="hover:bg-red-100 text-red-500 rounded-full p-0.5 transition-colors ml-1"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-libelle-teal/10">
            <Button
              type="submit"
              className="bg-libelle-teal hover:bg-libelle-teal/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : room ? "Atualizar Sala" : "Salvar Sala"}
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