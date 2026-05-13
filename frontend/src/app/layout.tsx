import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Importamos o componente de Providers que criaremos abaixo
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu Projeto Next.js",
  description: "Sistema com autenticação e internacionalização",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br" 
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Envolvemos o children com os Providers. 
            Isso garante que todas as páginas tenham acesso aos dados do usuário e simulação.
        */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}