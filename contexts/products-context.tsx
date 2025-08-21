// shopping-list-app/contexts/products-context.tsx

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
import { db } from "@/lib/firebase" // Importando a configuração do Firebase
import { useAuth } from "./auth-context"

// Interface atualizada com os novos campos e o tipo Date corrigido
export interface Product {
  id: string
  name: string
  category: string
  link: string
  observation: string
  value: number
  createdAt: Date // Usando Date para evitar erros de tipo
  userId: string
  needsToBuy: boolean
  wasPurchased: boolean
}

// O tipo para um novo produto, sem os campos automáticos
type NewProductData = Omit<Product, "id" | "createdAt" | "userId" | "needsToBuy" | "wasPurchased">

interface ProductsContextType {
  products: Product[]
  addProduct: (product: NewProductData) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProductsByUser: (userId: string) => Product[]
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const { user } = useAuth()

  // Este useEffect agora busca os dados do FIREBASE quando o usuário loga
  useEffect(() => {
    const fetchProducts = async (userId: string) => {
      if (!userId) {
        setProducts([])
        return
      }
      try {
        const q = query(collection(db, "products"), where("userId", "==", userId))
        const querySnapshot = await getDocs(q)
        
        const userProducts = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            // Convertendo o Timestamp do Firebase para um Date do JS
            createdAt: (data.createdAt as Timestamp).toDate(),
          } as Product
        })
        
        setProducts(userProducts)
      } catch (error) {
        console.error("Erro ao buscar produtos do Firebase:", error)
      }
    }

    if (user) {
      fetchProducts(user.id)
    } else {
      setProducts([]) // Limpa os produtos se o usuário fizer logout
    }
  }, [user])

  // Função para ADICIONAR um produto no FIREBASE
  const addProduct = async (productData: NewProductData) => {
    if (!user) return

    try {
      // Adicionando os novos campos com valores padrão
      const newProductData = {
        ...productData,
        createdAt: Timestamp.now(), // Data/hora atual do servidor
        userId: user.id,
        needsToBuy: false,      // Valor padrão
        wasPurchased: false,    // Valor padrão
      }
      
      const docRef = await addDoc(collection(db, "products"), newProductData)
      
      // Atualizando o estado local para a UI responder imediatamente
      setProducts((prev) => [
        ...prev,
        {
          ...productData,
          id: docRef.id,
          createdAt: new Date(),
          userId: user.id,
          needsToBuy: false,
          wasPurchased: false,
        },
      ])
    } catch (error) {
      console.error("Erro ao adicionar produto no Firebase:", error)
    }
  }

  // Função para ATUALIZAR um produto no FIREBASE
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const productRef = doc(db, "products", id)
      await updateDoc(productRef, productData)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...productData } : p)),
      )
    } catch (error) {
      console.error("Erro ao atualizar produto no Firebase:", error)
    }
  }

  // Função para DELETAR um produto no FIREBASE
  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id))
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Erro ao deletar produto no Firebase:", error)
    }
  }

  const getProductsByUser = (userId: string): Product[] => {
    return products.filter((product) => product.userId === userId)
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductsByUser,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}