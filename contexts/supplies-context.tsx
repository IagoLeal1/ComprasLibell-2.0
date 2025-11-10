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

export interface Supply {
  id: string
  name: string
  priority: "low" | "medium" | "high"
  value: number
  observation: string
  createdAt: Date // Alterado de string para Date
  userId: string
  isPurchased: boolean
}

// Novo tipo para adicionar suprimentos
type NewSupplyData = Omit<Supply, "id" | "createdAt" | "userId" | "isPurchased">

interface SuppliesContextType {
  supplies: Supply[]
  addSupply: (supply: NewSupplyData) => Promise<void>
  updateSupply: (id: string, supply: Partial<Supply>) => Promise<void>
  deleteSupply: (id: string) => Promise<void>
  isLoading: boolean // Adicionado estado de loading
}

const SuppliesContext = createContext<SuppliesContextType | undefined>(undefined)

export function SuppliesProvider({ children }: { children: React.ReactNode }) {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Buscar dados do Firebase
  useEffect(() => {
    const fetchSupplies = async (userId: string) => {
      if (!userId) {
        setSupplies([])
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const q = query(
          collection(db, "supplies"), // Nome da coleção: "supplies"
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        )
        const querySnapshot = await getDocs(q)
        const userSupplies = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
          } as Supply
        })
        setSupplies(userSupplies)
      } catch (error) {
        console.error("Erro ao buscar suprimentos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSupplies(user.id)
    } else {
      setSupplies([])
      setIsLoading(false)
    }
  }, [user])

  const addSupply = async (supplyData: NewSupplyData) => {
    if (!user) return

    const newSupplyData = {
      ...supplyData,
      userId: user.id,
      isPurchased: false,
      createdAt: Timestamp.now(),
    }

    try {
      const docRef = await addDoc(collection(db, "supplies"), newSupplyData)
      setSupplies((prev) => [
        {
          ...newSupplyData,
          id: docRef.id,
          createdAt: new Date(),
        },
        ...prev,
      ])
    } catch (error) {
      console.error("Erro ao adicionar suprimento:", error)
    }
  }

  const updateSupply = async (id: string, supplyData: Partial<Supply>) => {
    try {
      await updateDoc(doc(db, "supplies", id), supplyData)
      setSupplies(
        supplies.map((supply) =>
          supply.id === id ? { ...supply, ...supplyData } : supply,
        ),
      )
    } catch (error) {
      console.error("Erro ao atualizar suprimento:", error)
    }
  }

  const deleteSupply = async (id: string) => {
    try {
      await deleteDoc(doc(db, "supplies", id))
      setSupplies(supplies.filter((supply) => supply.id !== id))
    } catch (error) {
      console.error("Erro ao deletar suprimento:", error)
    }
  }

  return (
    <SuppliesContext.Provider
      value={{
        supplies,
        addSupply,
        updateSupply,
        deleteSupply,
        isLoading,
      }}
    >
      {children}
    </SuppliesContext.Provider>
  )
}

export function useSupplies() {
  const context = useContext(SuppliesContext)
  if (context === undefined) {
    throw new Error("useSupplies must be used within a SuppliesProvider")
  }
  return context
}