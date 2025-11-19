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
  ClipboardList,
  LayoutDashboard, // <-- 1. Novo ícone
} from "lucide-react"

// Links de navegação
const navLinks = [
  {
    href: "/dashboard",
    label: "Lista de Compras",
    icon: ShoppingCart,
  },
  {
    href: "/comprados",
    label: "Comprados",
    icon: CheckSquare,
  },
  {
    href: "/estoque",
    label: "Estoque",
    icon: Package,
  },
  {
    href: "/suprimentos",
    label: "Suprimentos",
    icon: ClipboardList,
  },
  {
    href: "/salas", // <-- 2. Nova rota
    label: "Salas",
    icon: LayoutDashboard,
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
  const pathname = usePathname()

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
              <div className="hidden md:block"> {/* Esconde textos em mobile para caber todos os botões */}
                <h1 className="text-xl font-bold text-libelle-dark-blue">
                  {title}
                </h1>
                <p className="text-sm text-libelle-teal">{subtitle}</p>
              </div>
            </div>

            {/* Lado Direito: Navegação e Sair */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar"> {/* Scroll horizontal em telas muito pequenas */}
              
              {navLinks.map((link) => (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <Link href={link.href} passHref>
                      <Button
                        variant={pathname === link.href ? "default" : "outline"}
                        size="icon"
                        className={
                          pathname !== link.href
                            ? "border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white"
                            : "bg-libelle-teal hover:bg-libelle-teal/90"
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
                    size="sm"
                    onClick={logout}
                    className="border-libelle-teal/30 text-libelle-teal hover:bg-libelle-teal hover:text-white ml-2"
                  >
                    <LogOut className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Sair</span>
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