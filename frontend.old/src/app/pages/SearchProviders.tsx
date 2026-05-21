import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Star, CheckCircle, SlidersHorizontal, Building2 } from "lucide-react";
import { Provider } from "../data/mockData";
import { getProviderDirectory } from "../data/providerDirectory";

export function SearchProviders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpecialty = searchParams.get("specialty") || "all";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  
  // Update selection if URL parameters change
  useEffect(() => {
    const specialty = searchParams.get("specialty");
    if (specialty) {
      setSelectedSpecialty(specialty);
    }
  }, [searchParams]);

  const [showFilters, setShowFilters] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyBusiness, setOnlyBusiness] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const providers = getProviderDirectory();

  const specialties = ["Todos", "Eletricista", "Encanador", "Pintor", "Pedreiro", "Ar Condicionado", "Marceneiro"];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = 
      selectedSpecialty === "all" || 
      provider.specialty === selectedSpecialty;

    const matchesVerified = !onlyVerified || provider.verified;
    const matchesBusiness = !onlyBusiness || provider.isBusiness;

    return matchesSearch && matchesSpecialty && matchesVerified && matchesBusiness;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Buscar Profissionais</h1>
          <p className="text-lg text-slate-500">Encontre os melhores especialistas para o seu projeto com avaliações reais.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/20 p-6 mb-10 border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex flex-wrap items-center gap-6 px-2 lg:px-0">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-600 transition-colors" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Verificados</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={onlyBusiness}
                  onChange={(e) => setOnlyBusiness(e.target.checked)}
                  className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-600 transition-colors" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Empresas</span>
              </label>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 pr-2 lg:pr-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 py-3 pl-4 pr-10 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer transition-all"
              >
                <option value="rating">Melhor Avaliado</option>
                <option value="reviews">Mais Opiniões</option>
              </select>
            </div>
          </div>

          {/* Specialty Filters */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => {
                const value = specialty === "Todos" ? "all" : specialty;
                return (
                  <button
                    key={specialty}
                    onClick={() => {
                      if (value === "all") {
                        searchParams.delete("specialty");
                      } else {
                        searchParams.set("specialty", value);
                      }
                      setSearchParams(searchParams);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedSpecialty === value 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'
                    }`}
                  >
                    {specialty}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-end">
          <p className="text-slate-500 font-medium bg-slate-100/50 px-4 py-2 rounded-lg inline-block">
            <span className="font-bold text-slate-900">{filteredProviders.length}</span> {filteredProviders.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
          </p>
        </div>

        {/* Providers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              Nenhum profissional encontrado
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Experimente ajustar os filtros de categoria ou busque por um termo diferente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link
      to={`/provider/${provider.id}`}
      className="bg-white rounded-[24px] overflow-hidden border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-[16px]">
        <img 
          src={provider.avatar} 
          alt={provider.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {provider.verified && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700">Verificado</span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
            {provider.name}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 border-amber-500" />
            <span className="font-bold text-sm text-amber-700">{provider.rating}</span>
          </div>
        </div>
        
        <p className="text-indigo-600 text-sm font-semibold mb-4">
          {provider.specialty}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-slate-50 rounded-xl mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 mb-0.5">Serviços</span>
            <span className="font-bold text-slate-900">{provider.completedJobs}+</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 mb-0.5">Resposta</span>
            <span className="font-bold text-slate-900">{provider.responseTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-0.5">A partir de</span>
            <span className="text-lg font-black text-slate-900">{provider.hourlyRate}</span>
          </div>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-indigo-600 transition-colors shadow-sm group-hover:shadow-md">
            Ver Perfil
          </button>
        </div>
      </div>
    </Link>
  );
}
