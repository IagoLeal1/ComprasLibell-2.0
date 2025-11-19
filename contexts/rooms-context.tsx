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

// Nova interface para o item da sala
export interface RoomItem {
  name: string
  category: string
}

export interface Room {
  id: string
  name: string
  items: RoomItem[] // Atualizado de string[] para RoomItem[]
  userId: string
  createdAt: Date
}

interface RoomsContextType {
  rooms: Room[]
  addRoom: (name: string, items: RoomItem[]) => Promise<void>
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
  isLoading: boolean
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined)

export function RoomsProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRooms = async (userId: string) => {
      if (!userId) {
        setRooms([])
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const q = query(
          collection(db, "rooms"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        )
        const querySnapshot = await getDocs(q)
        const userRooms = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          
          // Tratamento para migrar itens antigos que eram apenas strings
          const rawItems = data.items || []
          const formattedItems: RoomItem[] = rawItems.map((item: any) => {
            if (typeof item === 'string') {
              return { name: item, category: "Outros" }
            }
            return item
          })

          return {
            id: doc.id,
            ...data,
            items: formattedItems,
            createdAt: (data.createdAt as Timestamp).toDate(),
          } as Room
        })
        setRooms(userRooms)
      } catch (error) {
        console.error("Erro ao buscar salas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchRooms(user.id)
    } else {
      setRooms([])
      setIsLoading(false)
    }
  }, [user])

  const addRoom = async (name: string, items: RoomItem[]) => {
    if (!user) return

    const newRoomData = {
      name,
      items,
      userId: user.id,
      createdAt: Timestamp.now(),
    }

    try {
      const docRef = await addDoc(collection(db, "rooms"), newRoomData)
      setRooms((prev) => [
        {
          ...newRoomData,
          id: docRef.id,
          createdAt: new Date(),
        },
        ...prev,
      ])
    } catch (error) {
      console.error("Erro ao adicionar sala:", error)
    }
  }

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    try {
      await updateDoc(doc(db, "rooms", id), updates)
      setRooms(
        rooms.map((room) =>
          room.id === id ? { ...room, ...updates } : room,
        ),
      )
    } catch (error) {
      console.error("Erro ao atualizar sala:", error)
    }
  }

  const deleteRoom = async (id: string) => {
    try {
      await deleteDoc(doc(db, "rooms", id))
      setRooms(rooms.filter((room) => room.id !== id))
    } catch (error) {
      console.error("Erro ao deletar sala:", error)
    }
  }

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
        isLoading,
      }}
    >
      {children}
    </RoomsContext.Provider>
  )
}

export function useRooms() {
  const context = useContext(RoomsContext)
  if (context === undefined) {
    throw new Error("useRooms must be used within RoomsProvider")
  }
  return context
}