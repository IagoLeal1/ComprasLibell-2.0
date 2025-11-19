"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth-context"

export interface Todo {
  id: string
  task: string
  // assignedTo: string (Removido)
  // observation: string (Removido)
  isDone: boolean
  userId: string
  createdAt: Date
}

interface TodosContextType {
  todos: Todo[]
  addTodo: (task: string) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodoDone: (id: string) => Promise<void>
  isLoading: boolean
}

const TodosContext = createContext<TodosContextType | undefined>(undefined)

export function TodosProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchTodos = async (userId: string) => {
      if (!userId) {
        setTodos([])
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const q = query(
          collection(db, "todos"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        )
        const querySnapshot = await getDocs(q)
        const userTodos = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
          } as Todo
        })
        setTodos(userTodos)
      } catch (error) {
        console.error("Erro ao buscar afazeres:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchTodos(user.id)
    } else {
      setTodos([])
      setIsLoading(false)
    }
  }, [user])

  const addTodo = async (task: string) => {
    if (!user) return

    const newTodoData = {
      task,
      isDone: false,
      userId: user.id,
      createdAt: Timestamp.now(),
    }

    try {
      const docRef = await addDoc(collection(db, "todos"), newTodoData)
      setTodos((prev) => [
        {
          ...newTodoData,
          id: docRef.id,
          createdAt: new Date(),
        },
        ...prev,
      ])
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error)
    }
  }

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      await updateDoc(doc(db, "todos", id), updates)
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, ...updates } : todo,
        ),
      )
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "todos", id))
      setTodos(todos.filter((todo) => todo.id !== id))
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error)
    }
  }

  const toggleTodoDone = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    try {
      await updateDoc(doc(db, "todos", id), { isDone: !todo.isDone })
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, isDone: !t.isDone } : t,
        ),
      )
    } catch (error) {
      console.error("Erro ao alternar tarefa:", error)
    }
  }

  return (
    <TodosContext.Provider
      value={{
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodoDone,
        isLoading,
      }}
    >
      {children}
    </TodosContext.Provider>
  )
}

export function useTodos() {
  const context = useContext(TodosContext)
  if (context === undefined) {
    throw new Error("useTodos must be used within TodosProvider")
  }
  return context
}