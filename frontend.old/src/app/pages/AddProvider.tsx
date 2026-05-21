import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Phone, Briefcase, MapPin, FileText, Upload, X, Search, CheckCircle } from "lucide-react";
import { mockProviders } from "../data/mockData";

const specialties = [
  "Eletricista",
  "Encanador",
  "Pintor",
  "Pedreiro",
  "Jardineiro",
  "Marceneiro",
  "Serralheiro",
  "Chaveiro",
  "Mecânico",
  "Técnico em Ar Condicionado",
  "Instalador de Pisos",
  "Gesseiro",
  "Vidraceiro",
  "Tapeceiro",
  "Dedetizador"
];

export function AddProvider() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'new' | 'link'>('new');
  const [linkSearchTerm, setLinkSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bio: "",
    hourlyRate: ""
  });

  const [documents, setDocuments] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular cadastro bem-sucedido
    navigate('/business/dashboard');
  };

  const handleFileUpload = (files: FileList | null, type: 'documents' | 'photos') => {
    if (!files) return;
    const fileArray = Array.from(files);

    if (type === 'documents') {
      setDocuments([...documents, ...fileArray]);
    } else {
      setPhotos([...photos, ...fileArray]);
    }
  };

  const removeFile = (index: number, type: 'documents' | 'photos') => {
    if (type === 'documents') {
      setDocuments(documents.filter((_, i) => i !== index));
    } else {
      setPhotos(photos.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/business/dashboard"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao painel
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Adicionar Prestador</h1>
          <p className="text-gray-600 mt-2 font-medium">Adicione um novo profissional à sua equipe</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200 p-1 rounded-lg mb-6 w-full max-w-md mx-auto sm:mx-0">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('new')}
          >
            Cadastrar Novo
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('link')}
          >
            Vincular Existente
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Buscar Profissional</h2>
            <p className="text-sm text-gray-600 mb-4">Busque um prestador que já atua na plataforma para adicioná-lo ao perfil da sua empresa.</p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={linkSearchTerm}
                onChange={(e) => setLinkSearchTerm(e.target.value)}
                placeholder="Buscar pelo nome ou especialidade..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="mt-6 space-y-3">
              {linkSearchTerm.length >= 2 ? (
                mockProviders
                  .filter(p => !p.isBusiness && (p.name.toLowerCase().includes(linkSearchTerm.toLowerCase()) || p.specialty.toLowerCase().includes(linkSearchTerm.toLowerCase())))
                  .map(provider => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={provider.avatar} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-gray-900">{provider.name}</p>
                          <p className="text-sm text-gray-600">{provider.specialty} • {provider.location}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/business/dashboard')}
                        className="px-4 py-2 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-pink-700 transition-all shadow-lg shadow-pink-100"
                      >
                        Vincular
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>Digite pelo menos 2 caracteres para buscar</p>
                </div>
              )}
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Nome do prestador"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Informações Profissionais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade *
                </label>
                <select
                  id="specialty"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Selecione uma especialidade</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Experiência (anos)
                </label>
                <input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor por Hora (R$)
                </label>
                <input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Biografia/Descrição
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Conte um pouco sobre a experiência e habilidades do prestador..."
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="São Paulo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    id="state"
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="SP"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Documents Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload de Documentos (RG, CPF, Certificados)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files, 'documents')}
                    className="hidden"
                    id="documents-upload"
                  />
                  <label htmlFor="documents-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Clique para fazer upload ou arraste arquivos aqui
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG até 10MB</p>
                  </label>
                </div>
                {documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'documents')}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos de Trabalhos Anteriores
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files, 'photos')}
                    className="hidden"
                    id="photos-upload"
                  />
                  <label htmlFor="photos-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Clique para fazer upload ou arraste imagens aqui
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG até 10MB cada</p>
                  </label>
                </div>
                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-3">
                    {photos.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'photos')}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              to="/business/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-8 py-3 bg-pink-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-100"
            >
              Cadastrar Prestador
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
