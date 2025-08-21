// shopping-list-app/contexts/auth-context.tsx

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase" // Nossa configuração do Firebase!

// Interface para o nosso objeto de usuário
interface User {
  id: string
  email: string | null
  name: string | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // O onAuthStateChanged é um "ouvinte" do Firebase.
    // Ele nos notifica sempre que o status de login do usuário muda.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Se o usuário estiver logado, formatamos e salvamos seus dados
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        })
      } else {
        // Se não, limpamos os dados do usuário
        setUser(null)
      }
      setIsLoading(false)
    })

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Após criar o usuário, atualizamos o perfil dele com o nome
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name })
      }
      // O onAuthStateChanged irá lidar com a atualização do estado do usuário
      return true
    } catch (error) {
      console.error("Erro no registro:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}