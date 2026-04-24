// Mock data for providers
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  hourlyRate: string;
  avatar: string;
  verified: boolean;
  isPremium: boolean;
  completedJobs: number;
  responseTime: string;
  isBusiness?: boolean;
}

export interface ServiceShowcase {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price?: string;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  serviceType: string;
}

export interface ServiceRequest {
  id: string;
  providerId: string;
  providerName: string;
  clientId: string;
  clientName: string;
  serviceType: string;
  description: string;
  status: 'quote' | 'active' | 'completed' | 'cancelled';
  proposedValue?: string;
  address: string;
  createdAt: string;
  messages: ChatMessage[];
  photos?: string[];
  visitScheduled?: VisitSchedule;
  quoteDetails?: QuoteDetails;
  clientReview?: ClientReview;
  completedAt?: string;
}

export interface ClientReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'provider';
  message: string;
  timestamp: string;
  read?: boolean;
  readByClient?: boolean;
  readByProvider?: boolean;
}

export interface VisitSchedule {
  id: string;
  date: string;
  time: string;
  address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface QuoteDetails {
  id: string;
  serviceRequestId: string;
  value: string;
  description: string;
  includedItems: string[];
  estimatedDuration: string;
  validUntil: string;
  notes?: string;
  createdAt: string;
}

export const mockProviders: Provider[] = [
  {
    id: "1",
    name: "João Silva",
    specialty: "Eletricista",
    rating: 4.9,
    reviewCount: 127,
    location: "Cáceres, MT",
    hourlyRate: "R$ 80-120/hora",
    avatar: "https://i.pravatar.cc/150?img=12",
    verified: true,
    isPremium: true,
    completedJobs: 245,
    responseTime: "~2 horas"
  },
  {
    id: "7",
    name: "Conserta Tudo Ltda",
    specialty: "Multisserviços",
    rating: 4.9,
    reviewCount: 340,
    location: "Cáceres, MT",
    hourlyRate: "Sob orçamento",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop",
    verified: true,
    isPremium: true,
    completedJobs: 890,
    responseTime: "~30 min",
    isBusiness: true
  }
];

export const mockServiceShowcases: Record<string, ServiceShowcase[]> = {
  "1": [
    {
      id: "s1",
      title: "Instalação Elétrica Residencial Completa",
      description: "Instalação completa de sistema elétrico em apartamento de 80m²",
      images: ["https://images.unsplash.com/photo-1751486289947-4f5f5961b3aa?w=400"],
      category: "Eletricista",
      price: "R$ 3.500"
    }
  ],
  "7": [
    {
      id: "s7",
      title: "Manutenção Predial e Reformas",
      description: "Serviços completos de manutenção preventiva e corretiva para condomínios e empresas.",
      images: ["https://images.unsplash.com/photo-1581094288338-2314dddb7903?w=800&q=80"],
      category: "Multisserviços"
    }
  ]
};

export const mockReviews: Record<string, Review[]> = {
  "1": [
    {
      id: "r1",
      clientName: "Ana Costa",
      rating: 5,
      comment: "Excelente profissional! Muito pontual e caprichoso.",
      date: "2026-03-15",
      serviceType: "Instalação Elétrica"
    }
  ]
};

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: "req1",
    providerId: "1",
    providerName: "João Silva",
    clientId: "u_mock_ana",
    clientName: "Ana Costa",
    serviceType: "Eletricista",
    description: "Preciso instalar tomadas adicionais na sala e quarto. Segue foto do local.",
    status: "quote",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2026-04-08",
    photos: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80"],
    messages: [
      {
        id: "m1",
        sender: "client",
        message: "Olá! Preciso instalar 4 tomadas novas no apartamento.",
        timestamp: "2026-04-08T10:00:00",
        readByClient: true,
        readByProvider: false
      }
    ]
  },
  {
    id: "req2",
    providerId: "7",
    providerName: "Conserta Tudo Ltda",
    clientId: "u_mock_ana",
    clientName: "Ana Costa",
    serviceType: "Multisserviços",
    description: "Reparo geral na fachada da empresa.",
    status: "active",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    createdAt: "2026-04-05",
    messages: [
      {
        id: "m2",
        sender: "client",
        message: "Poderiam vir avaliar a fachada?",
        timestamp: "2026-04-05T14:00:00",
        readByClient: true,
        readByProvider: true
      }
    ]
  }
];