"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-libelle-light-green/20 to-libelle-light-teal/20">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logotipo%20libelle-vVoqhVPbABmfkevfXsDSi0xKPZzGV2.png"
              alt="Casa Libelle Logo"
              width={120}
              height={60}
              className="object-contain"
            />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-libelle-dark-blue mb-2">Lista de Compras</h2>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
