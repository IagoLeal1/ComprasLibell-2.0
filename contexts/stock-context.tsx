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
} from "firebase/firestore"
import { db } from "@/lib/firebase" // Importando nossa conexão com o Firebase
import { useAuth } from "./auth-context"

// Interface atualizada para usar Date em vez de string
export interface StockItem {
  id: string
  name: string
  category: string
  quantity: number
  minQuantity: number
  supplier: string
  sku: string
  unitValue: number
  observation: string
  createdAt: Date
  updatedAt: Date
  needsToBuy: boolean
  wasPurchased: boolean
  userId: string // Adicionado para vincular o item ao usuário
}

interface StockContextType {
  items: StockItem[]
  addItem: (item: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "userId" | "needsToBuy" | "wasPurchased">) => Promise<void>
  updateItem: (id: string, item: Partial<StockItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  getItemById: (id: string) => StockItem | undefined
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<StockItem[]>([])

  // Efeito para buscar os itens do Firestore quando o usuário é carregado
  useEffect(() => {
    const fetchItems = async (userId: string) => {
      if (!userId) {
        setItems([])
        return
      }
      try {
        const q = query(collection(db, "stockItems"), where("userId", "==", userId))
        const querySnapshot = await getDocs(q)
        
        const userItems = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            // Convertendo Timestamps do Firebase para objetos Date do JavaScript
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
          } as StockItem
        })
        
        setItems(userItems)
      } catch (error) {
        console.error("Erro ao buscar itens do estoque:", error)
      }
    }

    if (user) {
      fetchItems(user.id)
    } else {
      setItems([])
    }
  }, [user])

  // Adiciona um novo item ao Firestore
  const addItem = async (itemData: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "userId" | "needsToBuy" | "wasPurchased">) => {
    if (!user) return

    try {
      const newItemData = {
        ...itemData,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        needsToBuy: itemData.quantity <= itemData.minQuantity,
        wasPurchased: false,
      }

      const docRef = await addDoc(collection(db, "stockItems"), newItemData)
      
      // Atualiza o estado local para a UI responder na hora
      setItems((prev) => [
        ...prev,
        {
          ...newItemData,
          id: docRef.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
    } catch (error) {
      console.error("Erro ao adicionar item ao estoque:", error)
    }
  }

  // Atualiza um item existente no Firestore
  const updateItem = async (id: string, itemData: Partial<StockItem>) => {
    try {
      const itemRef = doc(db, "stockItems", id)
      const updateData = {
        ...itemData,
        updatedAt: Timestamp.now(), // Sempre atualiza a data de modificação
      }
      await updateDoc(itemRef, updateData)
      
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updateData, updatedAt: new Date() } : item)),
      )
    } catch (error) {
      console.error("Erro ao atualizar item do estoque:", error)
    }
  }

  // Deleta um item do Firestore
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "stockItems", id))
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Erro ao deletar item do estoque:", error)
    }
  }

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id)
  }

  return (
    <StockContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        getItemById,
      }}
    >
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext)
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider")
  }
  return context
}