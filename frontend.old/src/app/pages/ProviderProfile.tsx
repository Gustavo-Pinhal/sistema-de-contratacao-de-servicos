import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, MapPin, CheckCircle, ChevronLeft, ChevronRight, MessageCircle, Calendar, Award, Clock } from "lucide-react";
import { mockServiceShowcases, mockReviews } from "../data/mockData";
import { getProviderDirectory } from "../data/providerDirectory";

export function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<{ serviceId: string; imageIndex: number } | null>(null);
  const providers = getProviderDirectory();

  const provider = providers.find(p => p.id === id);
  const showcases = mockServiceShowcases[id || ""] || [];
  const reviews = mockReviews[id || ""] || [];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para busca
        </Link>

        {/* Provider Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
          {provider.isPremium && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              PRESTADOR PREMIUM
            </div>
          )}

          <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-start">
            {/* Avatar */}
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
            />

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{provider.name}</h1>
                {provider.verified && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <p className="text-lg text-green-600 font-black uppercase tracking-widest text-sm mb-4">{provider.specialty}</p>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-900">{provider.rating}</span>
                  <span className="text-gray-600">({provider.reviewCount} avaliações)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {provider.location}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Trabalhos</p>
                  <p className="text-xl font-bold text-gray-900">{provider.completedJobs}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Resposta</p>
                  <p className="text-xl font-bold text-gray-900">{provider.responseTime}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Valor médio</p>
                  <p className="text-sm font-bold text-gray-900">{provider.hourlyRate.split('-')[0]}</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full md:w-auto">
              <button
                onClick={() => navigate(`/request-quote/${provider.id}`)}
                className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 whitespace-nowrap"
              >
                Solicitar Orçamento
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Showcases */}
            {showcases.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Portfólio de Serviços</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {showcases.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onImageClick={(imageIndex) => setSelectedImage({ serviceId: service.id, imageIndex })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Avaliações Recentes</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Entre em Contato</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/request-quote/${provider.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                >
                  <MessageCircle className="w-4 h-4" />
                  Solicitar Orçamento
                </button>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">Tempo médio de resposta</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{provider.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sobre</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Identidade verificada</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{provider.completedJobs}+ trabalhos concluídos</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Membro desde 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          service={showcases.find(s => s.id === selectedImage.serviceId)!}
          currentIndex={selectedImage.imageIndex}
          onClose={() => setSelectedImage(null)}
          onNext={() => {
            const service = showcases.find(s => s.id === selectedImage.serviceId)!;
            const nextIndex = (selectedImage.imageIndex + 1) % service.images.length;
            setSelectedImage({ ...selectedImage, imageIndex: nextIndex });
          }}
          onPrev={() => {
            const service = showcases.find(s => s.id === selectedImage.serviceId)!;
            const prevIndex = selectedImage.imageIndex === 0 
              ? service.images.length - 1 
              : selectedImage.imageIndex - 1;
            setSelectedImage({ ...selectedImage, imageIndex: prevIndex });
          }}
        />
      )}
    </div>
  );
}

function ServiceCard({ service, onImageClick }: { service: any; onImageClick: (index: number) => void }) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="relative h-48 cursor-pointer group"
        onClick={() => onImageClick(0)}
      >
        <img
          src={service.images[0]}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {service.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            +{service.images.length - 1} fotos
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
        {service.price && (
          <p className="text-lg font-black text-green-600 tracking-tight">{service.price}</p>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  return (
    <div className="border-b pb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">{review.clientName}</p>
          <p className="text-sm text-gray-600">{review.serviceType}</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700 mb-2">{review.comment}</p>
      <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('pt-BR')}</p>
    </div>
  );
}

function ImageModal({ service, currentIndex, onClose, onNext, onPrev }: any) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={onPrev}
        className="absolute left-4 text-white hover:text-gray-300"
      >
        <ChevronLeft className="w-12 h-12" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 text-white hover:text-gray-300"
      >
        <ChevronRight className="w-12 h-12" />
      </button>

      <div className="max-w-4xl w-full">
        <img
          src={service.images[currentIndex]}
          alt={service.title}
          className="w-full h-auto rounded-lg"
        />
        <div className="text-white mt-4 text-center">
          <p className="font-semibold text-lg">{service.title}</p>
          <p className="text-gray-300">{currentIndex + 1} / {service.images.length}</p>
        </div>
      </div>
    </div>
  );
}
