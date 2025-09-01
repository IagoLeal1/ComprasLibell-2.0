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
  runTransaction,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth-context"

export interface StockItem {
  id: string
  name: string
  category: "Recorrente" | "Não Recorrente"
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
  userId: string
}

export interface StockMovement {
    id?: string
    itemId: string
    itemName: string
    userId: string
    userName: string
    takenBy: string
    type: "entrada" | "saída"
    quantityChange: number
    quantityAfter: number
    timestamp: Date
}

type NewStockData = Pick<StockItem, "name" | "quantity" | "observation" | "category">

interface StockContextType {
  items: StockItem[]
  addItem: (item: NewStockData) => Promise<void>
  updateItem: (id: string, item: Partial<StockItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  getItemById: (id: string) => StockItem | undefined
  logStockMovement: (itemId: string, quantityChange: number, type: "entrada" | "saída", takenBy?: string) => Promise<void>
  getItemMovements: (itemId: string) => Promise<StockMovement[]>
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<StockItem[]>([])

  useEffect(() => {
    const fetchItems = async (userId: string) => {
        if (!userId) { setItems([]); return }
        const q = query(collection(db, "stockItems"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const userItems = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                category: data.category || "Não Recorrente", // Define "Não Recorrente" como padrão
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: (data.updatedAt as Timestamp).toDate(),
            } as StockItem
        });
        setItems(userItems);
    };
    if (user) { fetchItems(user.id) } else { setItems([]) }
  }, [user]);

  const addItem = async (itemData: NewStockData) => {
    if (!user) return
    const newItemData = {
        ...itemData,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        needsToBuy: false,
        wasPurchased: false,
        minQuantity: 0,
        supplier: "",
        sku: "",
        unitValue: 0,
    };
    const docRef = await addDoc(collection(db, "stockItems"), newItemData);
    setItems(prev => [...prev, { ...newItemData, id: docRef.id, createdAt: new Date(), updatedAt: new Date() }]);
  }

  const updateItem = async (id: string, itemData: Partial<StockItem>) => {
    const itemRef = doc(db, "stockItems", id);
    const updateData = { ...itemData, updatedAt: Timestamp.now() };
    await updateDoc(itemRef, updateData);
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updateData, updatedAt: new Date() } : item));
  }
  
  const logStockMovement = async (itemId: string, quantityChange: number, type: "entrada" | "saída", takenBy: string = "N/A") => {
    if (!user) throw new Error("Usuário não autenticado.");

    const itemRef = doc(db, "stockItems", itemId);
    const movementLogRef = collection(db, "stockMovements");

    try {
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) {
          throw "Documento não existe!";
        }

        const currentQuantity = itemDoc.data().quantity;
        const newQuantity = currentQuantity + quantityChange;

        if (newQuantity < 0) {
            throw "A quantidade em estoque não pode ser negativa.";
        }
        
        transaction.update(itemRef, { quantity: newQuantity, updatedAt: Timestamp.now() });

        const movementData = {
            itemId: itemId,
            itemName: itemDoc.data().name,
            userId: user.id,
            userName: user.name || "N/A",
            takenBy: type === 'saída' ? takenBy : "Entrada no Estoque",
            type: type,
            quantityChange: quantityChange,
            quantityAfter: newQuantity,
            timestamp: Timestamp.now()
        };
        transaction.set(doc(movementLogRef), movementData);
      });

      setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + quantityChange, updatedAt: new Date() } : item));
      
    } catch (e) {
      console.error("Falha na transação: ", e);
      throw e;
    }
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "stockItems", id));
    setItems(prev => prev.filter(item => item.id !== id));
  }

  const getItemById = (id: string) => items.find(item => item.id === id);

  const getItemMovements = async (itemId: string): Promise<StockMovement[]> => {
    try {
        const q = query(
            collection(db, "stockMovements"),
            where("itemId", "==", itemId),
            where("type", "==", "saída"),
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: (doc.data().timestamp as Timestamp).toDate()
        })) as StockMovement[];
    } catch (error) {
        console.error("Erro ao buscar histórico do item:", error);
        return [];
    }
  }

  return (
    <StockContext.Provider
      value={{ items, addItem, updateItem, deleteItem, getItemById, logStockMovement, getItemMovements }}
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