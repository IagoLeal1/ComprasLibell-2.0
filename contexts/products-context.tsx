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
  deleteField,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth-context"

// ALTERAÇÃO: Adicionado "none" ao tipo de status
export interface Product {
  id: string
  name: string
  category: string
  link: string
  observation: string
  value: number
  createdAt: Date
  userId: string
  status: "none" | "pending" | "approved" | "rejected"
  paymentType: "cash" | "installments"
  installments?: number
  wasPurchased?: boolean
}

type NewProductData = Omit<Product, "id" | "createdAt" | "userId" | "status" | "wasPurchased">

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
      setProducts([])
    }
  }, [user])

  const addProduct = async (productData: NewProductData) => {
    if (!user) return

    try {
      const dataForFirebase = {
        ...productData,
        userId: user.id,
        createdAt: Timestamp.now(),
        status: "none" as const, // ALTERAÇÃO: Status padrão agora é "none"
        wasPurchased: false,
        installments: productData.paymentType === "installments" ? productData.installments || 1 : deleteField(),
      }
      
      const docRef = await addDoc(collection(db, "products"), dataForFirebase)
      
      const newProductForState: Product = {
        ...productData,
        id: docRef.id,
        userId: user.id,
        createdAt: new Date(),
        status: "none", // ALTERAÇÃO: Status padrão para o estado local
        wasPurchased: false,
      }
      
      setProducts((prev) => [...prev, newProductForState])

    } catch (error) {
      console.error("Erro ao adicionar produto no Firebase:", error)
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const productRef = doc(db, "products", id)
      const dataToUpdate = { ...productData }

      if (Object.prototype.hasOwnProperty.call(dataToUpdate, 'installments') && dataToUpdate.installments === undefined) {
        (dataToUpdate as any).installments = deleteField()
      }

      await updateDoc(productRef, dataToUpdate)

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const updatedProduct = { ...p, ...productData }
            if (productData.paymentType === 'cash') {
              delete updatedProduct.installments
            }
            return updatedProduct
          }
          return p
        }),
      )
    } catch (error) {
      console.error("Erro ao atualizar produto no Firebase:", error)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id))
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Erro ao deletar produto no Firebase:", error)
    }
  }

  const getProductsByUser = (userId: string) => {
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