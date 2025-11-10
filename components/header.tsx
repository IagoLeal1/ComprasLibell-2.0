"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LogOut,
  ShoppingCart,
  Package,
  CheckSquare,
  Users,
  List,
  ClipboardList, // <-- 1. Importar o novo ícone
} from "lucide-react"

// Links de navegação (com ícones corrigidos)
const navLinks = [
  {
    href: "/dashboard",
    label: "Lista de Compras",
    icon: ShoppingCart,
  },
  {
    href: "/comprados",
    label: "Comprados",
    icon: CheckSquare, // Mantido para "Comprados"
  },
  {
    href: "/estoque",
    label: "Estoque",
    icon: Package,
  },
  {
    href: "/suprimentos",
    label: "Suprimentos",
    icon: ClipboardList, // <-- 2. Ícone atualizado aqui
  },
  {
    href: "/afazeres",
    label: "Afazeres",
    icon: List,
  },
  {
    href: "/profissionais",
    label: "Profissionais",
    icon: Users,
  },
]

interface HeaderProps {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname() // Hook para saber a página atual

  return (
    <TooltipProvider delayDuration={0}>
      <header className="bg-white/95 backdrop-blur-sm border-b border-libelle-teal/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Lado Esquerdo: Logo e Títulos */}
            <div className="flex items-center space-x-4">
              <div className="p-2">
                <Image
                  src="/images/casa-libelle-logo.png"
                  alt="Casa Libelle Logo"
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-libelle-dark-blue">
                  {title}
                </h1>
                <p className="text-sm text-libelle-teal">{subtitle}</p>
              </div>
            </div>

            {/* Lado Direito: Navegação e Sair */}
            <div className="flex items-center gap-1">
              {" "}
              {/* Gap menor */}
              {/* Mapeia os links de navegação */}
              {navLinks.map((link) => (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <Link href={link.href} passHref>
                      <Button
                        variant={pathname === link.href ? "default" : "outline"}
                        size="icon"
                        className={
                          // Se o botão NÃO estiver ativo, aplica as classes de outline
                          pathname !== link.href
                            ? "border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white"
                            : "" // Se estiver ativo, usa apenas as classes do variant="default"
                        }
                        aria-label={link.label}
                      >
                        <link.icon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{link.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {/* Botão de Sair */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm" // Botão menor
                    onClick={logout}
                    className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white ml-2" // Margem para separar
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fazer Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}