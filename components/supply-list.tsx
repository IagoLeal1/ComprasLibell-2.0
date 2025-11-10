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
import { useSupplies, type Supply } from "@/contexts/supplies-context"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Package } from "lucide-react"

interface SupplyListProps {
  supplies: Supply[]
  onEditSupply: (supply: Supply) => void
}

export function SupplyList({ supplies, onEditSupply }: SupplyListProps) {
  const { updateSupply, deleteSupply } = useSupplies()
  const { toast } = useToast()

  const handleDeleteSupply = (supplyId: string, supplyName: string) => {
    deleteSupply(supplyId)
    toast({
      title: "Suprimento removido!",
      description: `${supplyName} foi removido da lista.`,
    })
  }

  const handlePurchasedChange = (supplyId: string, checked: boolean) => {
    updateSupply(supplyId, { isPurchased: checked })
    toast({
      title: checked ? "Marcado como comprado" : "Desmarcado como comprado",
      description: checked ? "Suprimento marcado como comprado." : "Suprimento desmarcado como comprado.",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
    }
    return labels[priority as keyof typeof labels] || "Baixa"
  }

  if (supplies.length === 0) {
    return (
      <div className="border border-libelle-teal/20 rounded-lg p-16 text-center">
        <div className="w-16 h-16 bg-libelle-light-green/30 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Package className="h-8 w-8 text-libelle-teal" />
        </div>
        <h3 className="text-xl font-semibold text-libelle-dark-blue mb-2">Nenhum suprimento encontrado</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Adicione suprimentos à sua lista para começar a organizar seus suprimentos empresariais.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-libelle-teal/20 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-libelle-teal/5">
            <TableHead className="w-12">Comprado</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Produto</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Prioridade</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Valor</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold">Observação</TableHead>
            <TableHead className="text-libelle-dark-blue font-semibold w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supplies.map((supply) => (
            <TableRow key={supply.id} className="hover:bg-libelle-teal/5 transition-colors">
              <TableCell>
                <Checkbox
                  checked={supply.isPurchased || false}
                  onCheckedChange={(checked) => handlePurchasedChange(supply.id, checked as boolean)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  title="Marcado como comprado"
                />
              </TableCell>
              <TableCell>
                <span className="font-medium text-libelle-dark-blue">{supply.name}</span>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(supply.priority)} variant="secondary">
                  {getPriorityLabel(supply.priority)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-libelle-teal">{formatCurrency(supply.value)}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{supply.observation || "-"}</span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditSupply(supply)}
                    className="h-8 w-8 p-0 hover:bg-libelle-teal/10 hover:text-libelle-teal"
                    title="Editar suprimento"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        title="Excluir suprimento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover "{supply.name}" da lista? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSupply(supply.id, supply.name)}
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
