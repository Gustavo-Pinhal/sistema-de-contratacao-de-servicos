import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Upload, X } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useUser } from "../context/UserContext";
import { getProviderDirectory } from "../data/providerDirectory";

export function RequestQuote() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { addServiceRequest } = useSimulation();
  const { user, isLoggedIn } = useUser();
  const providers = getProviderDirectory();
  
  const provider = providers.find(p => p.id === providerId);

  const [formData, setFormData] = useState({
    description: "",
    zipCode: user?.zipCode || "",
    address: user?.address || "",
    photos: [] as File[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !isLoggedIn || !user) {
      alert("Faça login como cliente para solicitar um orçamento.");
      navigate("/client/login");
      return;
    }

    const newRequestId = addServiceRequest({
      providerId: provider.id,
      providerName: provider.name,
      clientId: user.id,
      clientName: user.name,
      serviceType: provider.specialty,
      description: formData.description,
      address: formData.address,
    });

    alert("Orçamento solicitado com sucesso! Você será redirecionado para o chat.");
    navigate(`/service/${newRequestId}`); // Redireciona para o rastreamento/gerenciamento
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Prestador não encontrado</h1>
          <Link to="/search" className="text-green-600 hover:underline">
            Voltar para busca
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to={`/provider/${providerId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para perfil
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-black uppercase tracking-tight">Solicitar Orçamento</h1>
          <p className="text-gray-600 mb-4 font-medium">
            Preencha os detalhes do serviço que você precisa
          </p>

          {/* Provider Info */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white"
            />
            <div>
              <p className="text-xl font-black text-gray-900">{provider.name}</p>
              <p className="text-xs font-black uppercase tracking-widest text-green-600">{provider.specialty}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-gray-100 p-8 border border-gray-50">
          <div className="space-y-8">
            {/* Description */}
            <div>
              <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-3">
                Descrição do Serviço *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                placeholder="Descreva detalhadamente o serviço que você precisa..."
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-600 outline-none resize-none font-medium transition-all"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-3">
                Fotos (Opcional)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Adicione fotos para ajudar o prestador a entender melhor o serviço
              </p>

              {/* Photo Preview */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label className="flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-gray-700">Adicionar Fotos</span>
                  <span className="text-xs text-gray-400">Arraste ou clique para selecionar</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Address */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-3">
                  CEP *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-600 outline-none font-bold transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-3">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Rua, número, complemento, bairro"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-600 outline-none font-bold transition-all"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <p className="text-sm text-green-900 leading-relaxed">
                <span className="font-black uppercase tracking-widest text-[10px] bg-green-200 px-2 py-1 rounded-md mr-2">Importante</span>
                Após enviar sua solicitação, o prestador receberá todos os detalhes e poderá iniciar uma conversa para propor um orçamento. Você poderá acompanhar tudo em tempo real.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/provider/${providerId}`)}
                className="flex-1 px-8 py-4 border border-gray-200 rounded-xl font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 hover:-translate-y-0.5"
              >
                Enviar Solicitação
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
