"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useTodos } from "@/contexts/todos-context"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"

export default function AfazeresPage() {
  const [taskInput, setTaskInput] = useState("")
  const { user } = useAuth()
  const { todos, addTodo, deleteTodo, toggleTodoDone, isLoading } = useTodos()
  const { toast } = useToast()

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.isDone !== b.isDone) {
        return a.isDone ? 1 : -1
      }
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }, [todos])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskInput.trim()) {
      toast({
        title: "Erro",
        description: "Preencha a descrição da tarefa",
        variant: "destructive",
      })
      return
    }

    if (user) {
      await addTodo(taskInput)
      setTaskInput("")
      toast({
        title: "Sucesso",
        description: "Tarefa adicionada com sucesso",
      })
    }
  }

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id)
    toast({
      title: "Tarefa deletada",
      description: "A tarefa foi removida com sucesso",
    })
  }

  const handleToggleTodo = async (id: string) => {
    await toggleTodoDone(id)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-libelle-light-green/15 via-libelle-light-teal/10 to-libelle-teal/5">
        <Header title="Controle de Afazeres" subtitle={`Bem-vindo, ${user?.name}`} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-libelle-teal/20 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-libelle-teal/10">
              <CardTitle className="text-libelle-dark-blue">
                Gerenciador de Tarefas
              </CardTitle>
              <p className="text-sm text-libelle-teal mt-1">
                Adicione e acompanhe os afazeres da equipe.
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleAddTodo} className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <Input
                    placeholder="Descreva a nova tarefa..."
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    className="flex-1 focus:ring-libelle-teal focus:border-libelle-teal border-libelle-teal/20"
                  />
                  <Button
                    type="submit"
                    className="bg-libelle-teal hover:bg-libelle-teal/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </form>

              <div className="border border-libelle-teal/20 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-libelle-teal/5">
                    <TableRow className="border-b border-libelle-teal/20">
                      <TableHead className="w-12 text-libelle-dark-blue font-semibold">
                        Feito
                      </TableHead>
                      <TableHead className="text-libelle-dark-blue font-semibold">
                        Tarefa
                      </TableHead>
                      <TableHead className="text-libelle-dark-blue font-semibold">
                        Data
                      </TableHead>
                      <TableHead className="w-16 text-libelle-dark-blue font-semibold">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Carregando afazeres...
                        </TableCell>
                      </TableRow>
                    ) : sortedTodos.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhuma tarefa adicionada ainda
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedTodos.map((todo) => (
                        <TableRow
                          key={todo.id}
                          className="border-b border-libelle-teal/10 hover:bg-libelle-teal/5 transition-colors"
                        >
                          <TableCell className="w-12">
                            <Checkbox
                              checked={todo.isDone}
                              onCheckedChange={() => handleToggleTodo(todo.id)}
                              className="border-libelle-teal/30"
                            />
                          </TableCell>
                          <TableCell
                            className={`${
                              todo.isDone
                                ? "line-through text-muted-foreground"
                                : "text-libelle-dark-blue"
                            }`}
                          >
                            {todo.task}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(todo.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="text-libelle-coral hover:text-libelle-coral hover:bg-libelle-coral/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
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