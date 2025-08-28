"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStock, type StockItem, StockMovement } from "@/contexts/stock-context"
import { useProfessionals } from "@/contexts/professionals-context"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Package, ArrowDown, ArrowUp, History } from "lucide-react"

interface StockListProps {
  items: StockItem[]
  onEditItem: (item: StockItem) => void
  onDeleteItem: (itemId: string, itemName: string) => void
}

export function StockList({ items, onEditItem, onDeleteItem }: StockListProps) {
  const { logStockMovement, getItemMovements } = useStock();
  const { professionals } = useProfessionals();
  const { toast } = useToast();
  
  // States para o modal de movimentação
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [movementType, setMovementType] = useState<"entrada" | "saída">("saída");
  const [movementQuantity, setMovementQuantity] = useState(1);
  const [takenBy, setTakenBy] = useState<string>("");

  // States para o modal de histórico
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<StockMovement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const openMovementModal = (item: StockItem, type: "entrada" | "saída") => {
    setSelectedItem(item);
    setMovementType(type);
    setMovementQuantity(1);
    setTakenBy("");
    setIsMovementModalOpen(true);
  };
  
  const handleMovementSubmit = async () => {
    if (!selectedItem || movementQuantity <= 0) return;
    if (movementType === "saída" && !takenBy) {
      toast({ title: "Campo obrigatório", description: "Por favor, selecione o profissional que está retirando o item.", variant: "destructive" });
      return;
    }

    const quantityChange = movementType === "saída" ? -movementQuantity : movementQuantity;
    
    try {
      await logStockMovement(selectedItem.id, quantityChange, movementType, takenBy);
      toast({ title: "Movimentação registrada!", description: `Registrada ${movementType} de ${movementQuantity} unidade(s) de "${selectedItem.name}".` });
      setIsMovementModalOpen(false);
    } catch(error: any) {
      toast({ title: "Erro ao registrar movimentação", description: typeof error === 'string' ? error : "Não foi possível registrar a movimentação.", variant: "destructive" });
    }
  };

  const getPriorityColor = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) return "border-transparent bg-red-100 text-red-800";
    if (quantity <= minQuantity) return "border-transparent bg-yellow-100 text-yellow-800";
    return "border-transparent bg-blue-100 text-blue-800";
  }
  
  const getPriorityLabel = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) return "Esgotado";
    if (quantity <= minQuantity) return "Estoque Baixo";
    return "OK";
  }

  const handleShowHistory = async (item: StockItem) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    const movements = await getItemMovements(item.id);
    setHistoryLogs(movements);
    setIsLoadingHistory(false);
  };

  if (items.length === 0) {
    return (
      <div className="border border-libelle-teal/20 rounded-lg p-16 text-center">
        <div className="w-16 h-16 bg-libelle-light-green/30 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Package className="h-8 w-8 text-libelle-teal" />
        </div>
        <h3 className="text-xl font-semibold text-libelle-dark-blue mb-2">Nenhum item no estoque</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Adicione itens ao seu estoque para começar a gerenciá-lo.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-libelle-teal/20 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-libelle-teal/5">
              <TableHead className="text-libelle-dark-blue font-semibold">Item</TableHead>
              <TableHead className="text-libelle-dark-blue font-semibold">Quantidade</TableHead>
              <TableHead className="text-libelle-dark-blue font-semibold">Status</TableHead>
              <TableHead className="text-libelle-dark-blue font-semibold text-center w-48">Movimentar</TableHead>
              <TableHead className="text-libelle-dark-blue font-semibold w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-libelle-teal/5 transition-colors">
                <TableCell>
                  <button onClick={() => handleShowHistory(item)} className="text-left hover:underline">
                    <span className="font-medium text-libelle-dark-blue">{item.name}</span>
                  </button>
                  <p className="text-xs text-muted-foreground">{item.observation || ""}</p>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-libelle-dark-blue text-lg">{item.quantity}</span>
                  <span className="text-xs text-muted-foreground"> / min: {item.minQuantity}</span>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(item.quantity, item.minQuantity)} variant="secondary">
                    {getPriorityLabel(item.quantity, item.minQuantity)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button size="sm" variant="outline" className="mr-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => openMovementModal(item, "entrada")}>
                    <ArrowUp className="h-4 w-4 mr-1" /> Entrada
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => openMovementModal(item, "saída")}>
                    <ArrowDown className="h-4 w-4 mr-1" /> Saída
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEditItem(item)} className="h-8 w-8 p-0 hover:bg-libelle-teal/10 hover:text-libelle-teal" title="Editar item">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteItem(item.id, item.name)} className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" title="Excluir item">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Movimentação */}
      <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Registrar {movementType === "entrada" ? "Entrada" : "Saída"} de <span className="text-libelle-teal">{selectedItem?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {movementType === "saída" && (
                <div>
                    <Label htmlFor="professional">Retirado por</Label>
                    <Select value={takenBy} onValueChange={setTakenBy}>
                        <SelectTrigger id="professional">
                            <SelectValue placeholder="Selecione o profissional..." />
                        </SelectTrigger>
                        <SelectContent>
                            {professionals.map(prof => (
                                <SelectItem key={prof.id} value={prof.name}>{prof.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" type="number" value={movementQuantity} onChange={(e) => setMovementQuantity(Number(e.target.value))} min="1"/>
                <p className="text-xs text-muted-foreground mt-2">Estoque atual: {selectedItem?.quantity}</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleMovementSubmit}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Histórico de Saídas */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-libelle-teal" />
              Histórico de Saídas: <span className="text-libelle-teal">{selectedItem?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {isLoadingHistory ? (
              <p className="text-center py-8">Carregando histórico...</p>
            ) : historyLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Retirado por</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp.toLocaleDateString('pt-BR')} às {log.timestamp.toLocaleTimeString('pt-BR')}</TableCell>
                      <TableCell>{log.takenBy}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{log.quantityChange}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhuma saída registrada para este item.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}