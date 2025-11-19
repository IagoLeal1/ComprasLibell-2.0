"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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
import { ProtectedRoute } from "@/components/protected-route"
import { RoomForm } from "@/components/room-form"
import { useRooms, type Room } from "@/contexts/rooms-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, LayoutDashboard, Edit, Trash2, Box, Filter } from "lucide-react"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"

export default function RoomsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | undefined>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("") // Agora começa vazio (string)

  const { rooms, deleteRoom, isLoading } = useRooms()
  const { user } = useAuth()
  const { toast } = useToast()

  const filteredRooms = useMemo(() => {
    let result = rooms;

    // Filtro de busca (nome da sala ou nome do item)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(lowerTerm) ||
          room.items.some(item => item.name.toLowerCase().includes(lowerTerm))
      )
    }

    // Filtro de Categoria (Texto livre)
    if (filterCategory.trim()) {
      const lowerCat = filterCategory.toLowerCase()
      // Mostra a sala se ela tiver pelo menos um item que contenha o texto da categoria digitada
      result = result.filter(room => 
        room.items.some(item => item.category.toLowerCase().includes(lowerCat))
      )
    }

    return result
  }, [rooms, searchTerm, filterCategory])

  const handleAddRoom = () => {
    setEditingRoom(undefined)
    setIsFormOpen(true)
  }

  const handleEditRoom = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingRoom(room)
    setIsFormOpen(true)
  }
  
  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    await deleteRoom(roomId)
    toast({
        title: "Sala Removida",
        description: `A sala "${roomName}" foi removida com sucesso.`
    })
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingRoom(undefined)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-libelle-light-green/15 via-libelle-light-teal/10 to-libelle-teal/5">
        <Header title="Gerenciamento de Salas" subtitle={`Bem-vindo, ${user?.name}`} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <Card className="mb-8 border-libelle-teal/20 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                  
                  {/* Busca Geral */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-libelle-teal h-4 w-4" />
                    <Input 
                      placeholder="Buscar salas ou itens..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="pl-10 focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20" 
                    />
                  </div>

                  {/* Filtro de Categoria (Input Texto) */}
                  <div className="relative w-full sm:w-56">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Filtrar por categoria..."
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="pl-9 border-libelle-teal/20 focus:ring-libelle-teal focus:border-libelle-teal"
                    />
                  </div>

                </div>
                <Button onClick={handleAddRoom} className="w-full sm:w-auto bg-libelle-teal hover:bg-libelle-teal/90 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Sala
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando salas...</div>
          ) : filteredRooms.length === 0 ? (
             <div className="border border-libelle-teal/20 rounded-lg p-16 text-center bg-white/50">
                <div className="w-16 h-16 bg-libelle-light-green/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <LayoutDashboard className="h-8 w-8 text-libelle-teal" />
                </div>
                <h3 className="text-xl font-semibold text-libelle-dark-blue mb-2">Nenhuma sala encontrada</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchTerm || filterCategory 
                    ? "Tente ajustar seus filtros de busca." 
                    : "Adicione salas para começar a gerenciar os materiais de cada ambiente."}
                </p>
              </div>
          ) : (
            <Card className="border-libelle-teal/20 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle className="text-libelle-dark-blue flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5" /> Salas Cadastradas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {filteredRooms.map((room) => {
                            // Filtra os itens a serem exibidos dentro da sala com base no filtro global
                            const displayItems = filterCategory.trim() === ""
                                ? room.items 
                                : room.items.filter(item => item.category.toLowerCase().includes(filterCategory.toLowerCase()));

                            return (
                                <AccordionItem key={room.id} value={room.id} className="border-libelle-teal/10">
                                    <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-md group">
                                        <div className="flex items-center justify-between w-full mr-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                <span className="font-semibold text-libelle-dark-blue text-lg">{room.name}</span>
                                                {filterCategory && (
                                                    <Badge variant="outline" className="text-xs border-libelle-teal/30 text-libelle-teal w-fit">
                                                        Filtro: {filterCategory}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                                                <Box className="h-3 w-3" /> {room.items.length} itens total
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pt-4 pb-4 bg-slate-50/50">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-libelle-teal mb-2">
                                                {filterCategory ? `Itens encontrados (${filterCategory}):` : "Itens nesta sala:"}
                                            </h4>
                                            {displayItems.length > 0 ? (
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {displayItems.map((item, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm flex items-center justify-between">
                                                            <span>{item.name}</span>
                                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                                {item.category}
                                                            </Badge>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">Nenhum item encontrado para este filtro nesta sala.</p>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                            <Button size="sm" variant="outline" onClick={(e) => handleEditRoom(room, e)} className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal/10">
                                                <Edit className="h-4 w-4 mr-2" /> Editar
                                            </Button>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir Sala</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja remover a sala "{room.name}"? Todos os itens listados nela também serão removidos.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteRoom(room.id, room.name)} className="bg-red-500 hover:bg-red-600">
                                                            Confirmar Exclusão
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </CardContent>
            </Card>
          )}

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-libelle-teal/20">
              <DialogHeader>
                <DialogTitle className="sr-only">{editingRoom ? "Editar Sala" : "Adicionar Sala"}</DialogTitle>
              </DialogHeader>
              <RoomForm room={editingRoom} onClose={handleCloseForm} />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}