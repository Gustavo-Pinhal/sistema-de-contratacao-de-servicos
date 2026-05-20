"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30">
      <Navbar />

      <main className="flex-1 w-full">{children}</main>

      <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} ServiçoFácil. Todos os
            direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
