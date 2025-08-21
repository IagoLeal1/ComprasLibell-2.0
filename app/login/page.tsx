"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, LogIn, ShoppingCart } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema de lista de compras.",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-libelle-teal/5 via-libelle-light-green/10 to-libelle-green/5 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center space-y-6 pb-8 pt-8">
            <div className="flex justify-center">
              <div className="relative p-6 bg-gradient-to-br from-libelle-teal/10 to-libelle-green/10 rounded-3xl shadow-lg">
                <Image
                  src="/images/casa-libelle-logo.png"
                  alt="Casa Libelle Logo"
                  width={140}
                  height={70}
                  className="object-contain"
                />
                <div className="absolute -top-2 -right-2 bg-libelle-orange text-white p-2 rounded-full shadow-lg">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-libelle-dark-blue">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-libelle-teal text-lg">
                Acesse sua lista de compras empresarial
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="flex items-center space-x-2 text-libelle-dark-blue font-medium text-sm"
                >
                  <Mail className="h-4 w-4 text-libelle-teal" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-2 border-libelle-teal/20 focus:border-libelle-teal focus:ring-libelle-teal/20 rounded-xl transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="flex items-center space-x-2 text-libelle-dark-blue font-medium text-sm"
                >
                  <Lock className="h-4 w-4 text-libelle-teal" />
                  <span>Senha</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base border-2 border-libelle-teal/20 focus:border-libelle-teal focus:ring-libelle-teal/20 rounded-xl transition-all duration-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-libelle-teal to-libelle-green hover:from-libelle-teal/90 hover:to-libelle-green/90 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                <LogIn className="h-5 w-5 mr-2" />
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center pt-6 border-t border-libelle-teal/10">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="text-libelle-teal hover:text-libelle-green font-semibold hover:underline transition-colors duration-200"
                >
                  Criar conta gratuita
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-libelle-orange/10 rounded-xl border border-libelle-orange/20">
          <p className="text-sm text-libelle-dark-blue text-center">
            <strong>Dica:</strong> Crie uma conta nova ou use qualquer email/senha que você registrar
          </p>
        </div>
      </div>
    </div>
  )
}
