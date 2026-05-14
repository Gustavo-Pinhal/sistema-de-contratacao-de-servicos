"use client";

import { UserProvider } from "../context/UserContext";
import { ServiceProvider } from "../context/ServiceProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ServiceProvider>{children}</ServiceProvider>
    </UserProvider>
  );
}
