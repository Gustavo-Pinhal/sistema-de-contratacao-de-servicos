"use client";

import { UserProvider } from "../context/UserContext";
import { ServiceProvider } from "../context/ServiceProvider";
import { NotificationProvider } from "../context/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ServiceProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ServiceProvider>
    </UserProvider>
  );
}
