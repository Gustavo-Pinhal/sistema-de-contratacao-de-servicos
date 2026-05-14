import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Star, CheckCircle, Clock, XCircle, Edit, Trash2, Building2, Users, TrendingUp, DollarSign } from "lucide-react";
import { useUser } from "../context/UserContext";

interface Provider {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  rating: number;
  totalServices: number;
  activeServices: number;
  status: 'active' | 'inactive';
  avatar?: string;
}

const mockProviders: Provider[] = [
  {
    id: "1",
    name: "João Silva",
    specialty: "Eletricista",
    phone: "(11) 98765-4321",
    email: "joao.silva@empresa.com",
    rating: 4.8,
    totalServices: 45,
    activeServices: 3,
    status: 'active'
  },
  {
    id: "2",
    name: "Maria Santos",
    specialty: "Encanadora",
    phone: "(11) 98765-1234",
    email: "maria.santos@empresa.com",
    rating: 4.9,
    totalServices: 38,
    activeServices: 2,
    status: 'active'
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    specialty: "Pintor",
    phone: "(11) 98765-5678",
    email: "carlos.oliveira@empresa.com",
    rating: 4.7,
    totalServices: 52,
    activeServices: 1,
    status: 'active'
  },
  {
    id: "4",
    name: "Ana Paula",
    specialty: "Jardineira",
    phone: "(11) 98765-9012",
    email: "ana.paula@empresa.com",
    rating: 4.6,
    totalServices: 28,
    activeServices: 0,
    status: 'inactive'
  }
];

export function BusinessDashboard() {
  const { userPlan } = useUser();
  const [providers, setProviders] = useState(mockProviders);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const planName = userPlan === 'start' ? 'Plano Start' : 'Plano Expert';
  const isExpert = userPlan === 'expert' || !userPlan;

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalProviders = providers.length;
  const activeProviders = providers.filter(p => p.status === 'active').length;
  const totalActiveServices = providers.reduce((sum, p) => sum + p.activeServices, 0);
  const averageRating = (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isExpert ? 'bg-gradient-to-br from-pink-600 to-pink-500 shadow-pink-100' : 'bg-gray-400 shadow-gray-100'}`}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-gray-900">Painel Empresarial</h1>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${isExpert ? 'bg-pink-50 text-pink-700 border-pink-100' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    <Star className={`w-3 h-3 ${isExpert ? 'fill-pink-600 text-pink-600' : 'fill-gray-400 text-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{planName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-600 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">Empresa Demo Ltda.</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <p className="text-xs text-pink-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Destaque Premium Ativo
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-sm"
              >
                <DollarSign className="w-4 h-4" />
                Gerenciar Assinatura
              </button>
              <Link
                to="/business/add-provider"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-100 hover:-translate-y-0.5"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Prestadores</p>
                <p className="text-3xl font-black text-gray-900">{totalProviders}</p>
              </div>
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-600 transition-colors">
                <Users className="w-6 h-6 text-pink-600 group-hover:text-white transition-colors" />
              </div>
            </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Ativos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{activeProviders}</div>
            <p className="text-sm text-gray-600 mt-1">Prestadores</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Em andamento</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalActiveServices}</div>
            <p className="text-sm text-gray-600 mt-1">Serviços</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-600">Média</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{averageRating}</div>
            <p className="text-sm text-gray-600 mt-1">Avaliação</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar prestador por nome ou especialidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>

              <Link
                to="/business/add-provider"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                Adicionar Prestador
              </Link>
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Prestador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Especialidade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Serviços
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-600">Nenhum prestador encontrado</p>
                        <Link
                          to="/business/add-provider"
                          className="text-green-600 hover:text-green-700 font-semibold"
                        >
                          Adicionar primeiro prestador
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {provider.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{provider.name}</div>
                            <div className="text-sm text-gray-600">{provider.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{provider.specialty}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{provider.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold text-gray-900">{provider.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 font-semibold">
                            {provider.totalServices} total
                          </div>
                          <div className="text-gray-600">
                            {provider.activeServices} ativos
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {provider.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            <XCircle className="w-4 h-4" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
