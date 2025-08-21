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

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Erro na confirmação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const success = await register(email, password, name)

    if (success) {
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao sistema de lista de compras.",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Erro no cadastro",
        description: "Este email já está em uso.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-libelle-light-green/20 to-libelle-light-teal/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logotipo%20libelle-vVoqhVPbABmfkevfXsDSi0xKPZzGV2.png"
              alt="Casa Libelle Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-libelle-dark-blue">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se para acessar o sistema de compras</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="focus:ring-libelle-teal focus:border-libelle-teal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-libelle-teal focus:border-libelle-teal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="focus:ring-libelle-teal focus:border-libelle-teal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="focus:ring-libelle-teal focus:border-libelle-teal"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-libelle-teal hover:bg-libelle-teal/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-libelle-teal hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
