import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Roboto } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ProductsProvider } from "@/contexts/products-context"
import { StockProvider } from "@/contexts/stock-context"
import { ProfessionalsProvider } from "@/contexts/professionals-context"
import { TodosProvider } from "@/contexts/todos-context"
import { SuppliesProvider } from "@/contexts/supplies-context"
// 1. Importe o RoomsProvider aqui
import { RoomsProvider } from "@/contexts/rooms-context"
import { Toaster } from "@/components/ui/toaster"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Lista de Compras - Casa Libelle",
  description: "Sistema de gestão de compras empresarial",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${roboto.style.fontFamily}, ${GeistSans.style.fontFamily};
  --font-sans: ${roboto.variable}, ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-roboto: ${roboto.variable};
}
        `}</style>
      </head>
      <body
        className={`${roboto.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <AuthProvider>
          <ProductsProvider>
            <StockProvider>
              <ProfessionalsProvider>
                <TodosProvider>
                  <SuppliesProvider>
                    {/* 2. Envolva o children e o Toaster com o RoomsProvider */}
                    <RoomsProvider>
                      {children}
                      <Toaster />
                    </RoomsProvider>
                  </SuppliesProvider>
                </TodosProvider>
              </ProfessionalsProvider>
            </StockProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}