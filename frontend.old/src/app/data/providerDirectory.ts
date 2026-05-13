import { Provider, mockProviders } from "./mockData";

type SimulatedUser = {
  id: string;
  name: string;
  role: "client" | "provider" | "business" | null;
  plan?: string;
  city?: string;
  state?: string;
  avatar?: string;
  service?: string;
  specialty?: string;
  hourlyRate?: string;
  responseTime?: string;
};

function parseSimulatedUsers(): SimulatedUser[] {
  try {
    const raw = localStorage.getItem("sim_allUsers");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatHourlyRate(value?: string): string {
  if (!value || !value.trim()) return "Sob orçamento";
  if (value.toLowerCase().includes("r$")) return value;
  return `R$ ${value}/hora`;
}

function buildLocation(city?: string, state?: string): string {
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return "Localização não informada";
}

export function getProviderDirectory(): Provider[] {
  const simulatedProviders: Provider[] = parseSimulatedUsers()
    .filter((user) => user.role === "provider")
    .map((user) => ({
      id: user.id,
      name: user.name,
      specialty: user.specialty || user.service || "Prestador de Serviços",
      rating: 5,
      reviewCount: 0,
      location: buildLocation(user.city, user.state),
      hourlyRate: formatHourlyRate(user.hourlyRate),
      avatar:
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=00C853&color=fff`,
      verified: true,
      isPremium: user.plan === "premium",
      completedJobs: 0,
      responseTime: user.responseTime || "~2 horas",
    }));

  const byId = new Map<string, Provider>();
  [...mockProviders, ...simulatedProviders].forEach((provider) => {
    byId.set(provider.id, provider);
  });

  return Array.from(byId.values());
}
