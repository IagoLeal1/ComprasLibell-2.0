// shopping-list-app/app/profissionais/page.tsx

"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProtectedRoute } from "@/components/protected-route"
import { useProfessionals, Professional } from "@/contexts/professionals-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LogOut, List, Users, Trash2, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ProfessionalsPage() {
  const { professionals, addProfessional, deleteProfessional, isLoading } = useProfessionals()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [newProfessionalName, setNewProfessionalName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddProfessional = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProfessionalName.trim()) {
      toast({ title: "Nome inválido", description: "O nome não pode estar em branco.", variant: "destructive" })
      return
    }

    setIsAdding(true)
    try {
      await addProfessional(newProfessionalName)
      toast({ title: "Sucesso!", description: `"${newProfessionalName}" foi adicionado(a) à lista.` })
      setNewProfessionalName("")
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar o profissional.", variant: "destructive" })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteProfessional = async (professional: Professional) => {
    if (window.confirm(`Tem certeza que deseja remover "${professional.name}"?`)) {
      try {
        await deleteProfessional(professional.id)
        toast({ title: "Removido!", description: `"${professional.name}" foi removido(a) da lista.` })
      } catch (error) {
        toast({ title: "Erro", description: "Não foi possível remover o profissional.", variant: "destructive" })
      }
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-libelle-light-green/15 via-libelle-light-teal/10 to-libelle-teal/5">
        <header className="bg-white/95 backdrop-blur-sm border-b border-libelle-teal/20 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="p-2"><Image src="/images/casa-libelle-logo.png" alt="Casa Libelle Logo" width={80} height={40} className="object-contain" /></div>
                <div>
                  <h1 className="text-xl font-bold text-libelle-dark-blue">Gerenciar Profissionais</h1>
                  <p className="text-sm text-libelle-teal">Adicione ou remova nomes da lista</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard"><Button variant="outline" className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white"><List className="h-4 w-4 mr-2" />Lista de Compras</Button></Link>
                <Button variant="outline" onClick={logout} className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white"><LogOut className="h-4 w-4 mr-2" />Sair</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-libelle-teal/20 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-libelle-dark-blue"><Users /> Lista de Profissionais</CardTitle>
              <CardDescription>Esta é a lista que aparecerá no modal de saída de estoque.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProfessional} className="flex gap-2 mb-4">
                <Input
                  placeholder="Nome completo do novo profissional"
                  value={newProfessionalName}
                  onChange={(e) => setNewProfessionalName(e.target.value)}
                  disabled={isAdding}
                />
                <Button type="submit" className="bg-libelle-teal hover:bg-libelle-teal/90 text-white" disabled={isAdding}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isAdding ? "Adicionando..." : "Adicionar"}
                </Button>
              </form>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-libelle-teal/5">
                      <TableHead className="text-libelle-dark-blue font-semibold">Nome</TableHead>
                      <TableHead className="w-24 text-right text-libelle-dark-blue font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={2} className="text-center">Carregando...</TableCell></TableRow>
                    ) : professionals.length > 0 ? (
                      professionals.map((prof) => (
                        <TableRow key={prof.id} className="hover:bg-libelle-teal/5">
                          <TableCell className="font-medium">{prof.name}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteProfessional(prof)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={2} className="text-center">Nenhum profissional cadastrado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}