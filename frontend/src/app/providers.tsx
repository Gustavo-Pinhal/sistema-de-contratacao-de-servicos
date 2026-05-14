"use client";

import { UserProvider } from './context/UserContext';
import { SimulationProvider } from './context/SimulationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SimulationProvider>
        {children}
      </SimulationProvider>
    </UserProvider>
  );
}