// shopping-list-app/contexts/professionals-context.tsx

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Professional {
  id: string
  name: string
}

interface ProfessionalsContextType {
  professionals: Professional[]
  isLoading: boolean
  addProfessional: (name: string) => Promise<void>
  deleteProfessional: (id: string) => Promise<void>
}

const ProfessionalsContext = createContext<ProfessionalsContextType | undefined>(undefined)

export function ProfessionalsProvider({ children }: { children: React.ReactNode }) {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfessionals = async () => {
    try {
      const q = query(collection(db, "professionals"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const professionalsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Professional[];
      setProfessionals(professionalsList);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const addProfessional = async (name: string) => {
    const docRef = await addDoc(collection(db, "professionals"), { name });
    // Atualiza o estado local para a UI refletir a mudança imediatamente
    setProfessionals(prev => [...prev, { id: docRef.id, name }].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const deleteProfessional = async (id: string) => {
    await deleteDoc(doc(db, "professionals", id));
    // Atualiza o estado local
    setProfessionals(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProfessionalsContext.Provider value={{ professionals, isLoading, addProfessional, deleteProfessional }}>
      {children}
    </ProfessionalsContext.Provider>
  )
}

export function useProfessionals() {
  const context = useContext(ProfessionalsContext)
  if (context === undefined) {
    throw new Error("useProfessionals must be used within a ProfessionalsProvider")
  }
  return context
}