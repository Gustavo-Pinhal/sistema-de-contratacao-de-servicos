import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Building2, MapPin, Image as ImageIcon, Upload, X, Camera } from "lucide-react";

export function EditBusinessProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "Empresa Demo Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@empresademo.com",
    phone: "(11) 3456-7890",
    bio: "Especialistas em manutenções em geral. Atendemos toda a cidade com rapidez e eficiência.",
    address: "Avenida Principal, 1000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01000-000",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
  });

  const [photos, setPhotos] = useState<File[]>([]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular salvar e voltar
    navigate('/business/dashboard');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setPhotos([...photos, ...fileArray]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/business/dashboard"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-4 font-black text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao painel
          </Link>
          <h1 className="text-3xl font-black text-gray-900">Editar Perfil da Empresa</h1>
          <p className="text-gray-600 mt-2 font-medium">Atualize as informações públicas, endereço e marca da empresa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Picture Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                <img 
                  src={avatarPreview || formData.avatar} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-all shadow-lg border-2 border-white"
              >
                <Camera className="w-5 h-5" />
                <input 
                  id="avatar-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Logotipo da Empresa</h3>
              <p className="text-xs text-gray-500 mt-1">Sua marca aparecerá nos resultados e orçamentos</p>
            </div>
          </div>
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações Gerais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone Comercial</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sobre a Empresa (Biografia)</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Sede/Endereço
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro Completo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Portfólio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Portfólio de Serviços
            </h2>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicione fotos de projetos executados pela sua empresa
            </label>
            <div className="border-2 border-dashed border-pink-200 rounded-lg p-6 text-center hover:bg-pink-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Clique ou arraste imagens aqui</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG até 5MB cada</p>
            </div>
            
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((file, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Foto Portfólio ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Link
              to="/business/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all shadow-md"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
