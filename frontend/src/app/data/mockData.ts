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
    id: "2",
    name: "Maria Santos",
    specialty: "Encanador",
    rating: 4.8,
    reviewCount: 89,
    location: "Cáceres, MT",
    hourlyRate: "R$ 70-100/hora",
    avatar: "https://i.pravatar.cc/150?img=5",
    verified: true,
    isPremium: true,
    completedJobs: 156,
    responseTime: "~1 hora"
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    specialty: "Pintor",
    rating: 4.7,
    reviewCount: 203,
    location: "Cáceres, MT",
    hourlyRate: "R$ 60-90/hora",
    avatar: "https://i.pravatar.cc/150?img=33",
    verified: true,
    isPremium: false,
    completedJobs: 312,
    responseTime: "~3 horas"
  },
  {
    id: "4",
    name: "Pedro Costa",
    specialty: "Pedreiro",
    rating: 4.9,
    reviewCount: 145,
    location: "Cáceres, MT",
    hourlyRate: "R$ 90-130/hora",
    avatar: "https://i.pravatar.cc/150?img=15",
    verified: true,
    isPremium: true,
    completedJobs: 198,
    responseTime: "~2 horas"
  },
  {
    id: "5",
    name: "Ana Rodrigues",
    specialty: "Ar Condicionado",
    rating: 5.0,
    reviewCount: 67,
    location: "Cáceres, MT",
    hourlyRate: "R$ 100-150/hora",
    avatar: "https://i.pravatar.cc/150?img=9",
    verified: true,
    isPremium: true,
    completedJobs: 89,
    responseTime: "~1 hora"
  },
  {
    id: "6",
    name: "Lucas Ferreira",
    specialty: "Marceneiro",
    rating: 4.8,
    reviewCount: 112,
    location: "Cáceres, MT",
    hourlyRate: "R$ 85-115/hora",
    avatar: "https://i.pravatar.cc/150?img=52",
    verified: true,
    isPremium: false,
    completedJobs: 167,
    responseTime: "~4 horas"
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
    },
    {
      id: "s2",
      title: "Manutenção de Quadro Elétrico",
      description: "Revisão e atualização de quadro elétrico residencial",
      images: ["https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400"],
      category: "Eletricista"
    }
  ],
  "2": [
    {
      id: "s3",
      title: "Instalação de Tubulação",
      description: "Sistema completo de tubulação para casa nova",
      images: ["https://images.unsplash.com/photo-1768321916212-17ae334a3d63?w=400"],
      category: "Encanador",
      price: "R$ 4.200"
    }
  ]
};

export const mockReviews: Record<string, Review[]> = {
  "1": [
    {
      id: "r1",
      clientName: "Fernanda Lima",
      rating: 5,
      comment: "Excelente profissional! Muito pontual e caprichoso. Resolveu o problema elétrico rapidamente.",
      date: "2026-03-15",
      serviceType: "Instalação Elétrica"
    },
    {
      id: "r2",
      clientName: "Roberto Campos",
      rating: 5,
      comment: "Trabalho impecável. João é muito atencioso e explica tudo o que está fazendo. Recomendo!",
      date: "2026-03-10",
      serviceType: "Manutenção"
    },
    {
      id: "r3",
      clientName: "Juliana Souza",
      rating: 4,
      comment: "Bom trabalho, porém chegou um pouco atrasado. Mas o serviço foi bem feito.",
      date: "2026-02-28",
      serviceType: "Troca de Tomadas"
    }
  ],
  "2": [
    {
      id: "r4",
      clientName: "Marcos Alves",
      rating: 5,
      comment: "Maria é extremamente profissional. Identificou e resolveu um vazamento que outros não conseguiram.",
      date: "2026-03-20",
      serviceType: "Reparo de Vazamento"
    },
    {
      id: "r5",
      clientName: "Patricia Gomes",
      rating: 5,
      comment: "Ótima prestadora! Muito educada e trabalho perfeito.",
      date: "2026-03-05",
      serviceType: "Instalação"
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
    description: "Preciso instalar tomadas adicionais na sala e quarto",
    status: "active",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2026-04-08",
    quoteDetails: {
      id: "q1",
      serviceRequestId: "req1",
      value: "R$ 850,00",
      description: "Instalação de 4 tomadas novas com eletrodutos e acabamento",
      includedItems: [
        "4 tomadas padrão brasileiro",
        "Eletrodutos e fiação",
        "Mão de obra especializada",
        "Acabamento e pintura nos pontos",
        "Garantia de 6 meses"
      ],
      estimatedDuration: "4 horas",
      validUntil: "2026-04-15",
      notes: "Visita prévia recomendada para confirmar detalhes",
      createdAt: "2026-04-08T14:00:00"
    },
    messages: [
      {
        id: "m1",
        sender: "client",
        message: "Olá! Preciso instalar 4 tomadas novas no apartamento.",
        timestamp: "2026-04-08T10:00:00"
      },
      {
        id: "m1b",
        sender: "provider",
        message: "Olá Ana! Enviei uma proposta detalhada. Posso agendar uma visita para confirmar os detalhes se desejar.",
        timestamp: "2026-04-08T14:00:00"
      }
    ]
  },
  {
    id: "req2",
    providerId: "1",
    providerName: "João Silva",
    clientId: "u_mock_carlos",
    clientName: "Carlos Mendes",
    serviceType: "Eletricista",
    description: "Revisão completa do sistema elétrico",
    status: "active",
    proposedValue: "R$ 1.800",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    createdAt: "2026-04-05",
    visitScheduled: {
      id: "v1",
      date: "2026-04-12",
      time: "14:00",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      notes: "Portão azul, interfone 302",
      status: "confirmed"
    },
    quoteDetails: {
      id: "q2",
      serviceRequestId: "req2",
      value: "R$ 1.800,00",
      description: "Revisão completa do sistema elétrico residencial",
      includedItems: [
        "Inspeção completa de todo sistema elétrico",
        "Teste de aterramento e disjuntores",
        "Relatório técnico detalhado",
        "Substituição de componentes defeituosos",
        "Certificado de conformidade"
      ],
      estimatedDuration: "1 dia",
      validUntil: "2026-04-20",
      createdAt: "2026-04-05T14:30:00"
    },
    messages: [
      {
        id: "m2",
        sender: "client",
        message: "Preciso de uma revisão completa da parte elétrica.",
        timestamp: "2026-04-05T14:00:00"
      },
      {
        id: "m3",
        sender: "provider",
        message: "Claro! Posso fazer uma visita amanhã para avaliar. O valor estimado seria em torno de R$ 1.800.",
        timestamp: "2026-04-05T14:30:00"
      },
      {
        id: "m4",
        sender: "client",
        message: "Perfeito! Aceito o orçamento.",
        timestamp: "2026-04-05T15:00:00"
      }
    ]
  },
  {
    id: "req3",
    providerId: "2",
    providerName: "Maria Santos",
    clientId: "u_mock_ana",
    clientName: "Ana Costa",
    serviceType: "Encanador",
    description: "Vazamento no banheiro que precisa ser corrigido",
    status: "quote",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2026-04-09",
    quoteDetails: {
      id: "q3",
      serviceRequestId: "req3",
      value: "R$ 450,00",
      description: "Reparo de vazamento em tubulação do banheiro",
      includedItems: [
        "Identificação do vazamento",
        "Substituição de tubos danificados",
        "Materiais inclusos",
        "Teste de pressão",
        "Limpeza do local"
      ],
      estimatedDuration: "3 horas",
      validUntil: "2026-04-16",
      createdAt: "2026-04-09T10:30:00"
    },
    messages: [
      {
        id: "m5",
        sender: "client",
        message: "Tenho um vazamento no banheiro. Pode me ajudar?",
        timestamp: "2026-04-09T09:00:00"
      },
      {
        id: "m6",
        sender: "provider",
        message: "Sim! Enviei um orçamento. Posso ir amanhã mesmo se precisar!",
        timestamp: "2026-04-09T10:30:00"
      }
    ]
  },
  {
    id: "req4",
    providerId: "4",
    providerName: "Pedro Costa",
    clientId: "u_mock_ana",
    clientName: "Ana Costa",
    serviceType: "Pedreiro",
    description: "Construção de uma parede divisória",
    status: "completed",
    proposedValue: "R$ 2.500",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2026-03-20",
    completedAt: "2026-03-25",
    messages: [
      {
        id: "m7",
        sender: "client",
        message: "Preciso construir uma parede para dividir um cômodo.",
        timestamp: "2026-03-20T11:00:00"
      },
      {
        id: "m8",
        sender: "provider",
        message: "Trabalho concluído! Espero que tenha gostado do resultado.",
        timestamp: "2026-03-25T17:00:00"
      }
    ]
  },
  {
    id: "req5",
    providerId: "3",
    providerName: "Carlos Oliveira",
    clientId: "u_mock_ana",
    clientName: "Ana Costa",
    serviceType: "Pintor",
    description: "Pintura completa de dois quartos",
    status: "completed",
    proposedValue: "R$ 1.200",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2026-03-10",
    completedAt: "2026-03-18",
    clientReview: {
      id: "rev1",
      rating: 5,
      comment: "Trabalho impecável! Carlos é muito profissional, caprichoso e deixou tudo muito limpo. A pintura ficou perfeita, sem nenhum defeito. Super recomendo!",
      createdAt: "2026-03-19T10:00:00"
    },
    messages: [
      {
        id: "m9",
        sender: "client",
        message: "Gostaria de pintar dois quartos. Pode me passar um orçamento?",
        timestamp: "2026-03-10T09:00:00"
      },
      {
        id: "m10",
        sender: "provider",
        message: "Claro! Posso fazer uma visita amanhã para ver os quartos e passar um orçamento detalhado.",
        timestamp: "2026-03-10T10:00:00"
      }
    ]
  },
  {
    id: "req6",
    providerId: "1",
    providerName: "João Silva",
    clientId: "u_mock_ana",
    clientName: "Ana Costa",
    serviceType: "Eletricista",
    description: "Instalação de ventilador de teto",
    status: "completed",
    proposedValue: "R$ 350",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2026-02-15",
    completedAt: "2026-02-16",
    clientReview: {
      id: "rev2",
      rating: 5,
      comment: "Excelente profissional! Muito pontual e caprichoso. Instalou o ventilador rapidamente e funcionou perfeitamente.",
      createdAt: "2026-02-17T14:00:00"
    },
    messages: [
      {
        id: "m11",
        sender: "client",
        message: "Preciso instalar um ventilador de teto na sala.",
        timestamp: "2026-02-15T08:00:00"
      }
    ]
  },
  {
    id: "req7",
    providerId: "2",
    providerName: "Maria Santos",
    clientId: "u_mock_carlos",
    clientName: "Carlos Mendes",
    serviceType: "Encanador",
    description: "Troca de torneiras e registros",
    status: "completed",
    proposedValue: "R$ 600",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    createdAt: "2026-03-28",
    completedAt: "2026-03-30",
    clientReview: {
      id: "rev3",
      rating: 5,
      comment: "Maria é extremamente profissional e atenciosa. Trocou todas as torneiras com muito cuidado e limpou tudo depois. Recomendo!",
      createdAt: "2026-03-31T09:00:00"
    },
    messages: [
      {
        id: "m12",
        sender: "client",
        message: "Preciso trocar as torneiras de 3 banheiros.",
        timestamp: "2026-03-28T10:00:00"
      }
    ]
  },
  {
    id: "req8",
    providerId: "1",
    providerName: "João Silva",
    clientId: "u_mock_roberto",
    clientName: "Roberto Campos",
    serviceType: "Eletricista",
    description: "Instalação de refletores no jardim",
    status: "cancelled",
    proposedValue: "R$ 400",
    address: "Rua do Bosque, 45 - São Paulo, SP",
    createdAt: "2026-04-10",
    messages: [
      {
        id: "m13",
        sender: "client",
        message: "Boa tarde, preciso instalar 3 refletores de LED no jardim lateral.",
        timestamp: "2026-04-10T14:00:00"
      },
      {
        id: "m14",
        sender: "provider",
        message: "Infelizmente no momento estou com a agenda lotada para as próximas duas semanas e precisarei recusar este orçamento.",
        timestamp: "2026-04-11T09:00:00"
      }
    ]
  }
];