import "./globals.css";
import { Providers } from "./providers";
import { MainLayout } from "./components/MainLayout";

export const metadata = {
  title: "ServiçoFácil",
  description: "Conecte-se com prestadores de serviço de forma rápida e fácil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="h-full antialiased bg-slate-50">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
