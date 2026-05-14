import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Star, Calendar, User, ChevronLeft, MessageSquare } from "lucide-react";
import { useUser } from "../context/UserContext";

interface Review {
  id: string;
  serviceId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  providerId: string;
  providerName?: string;
  serviceName?: string;
}

export function ClientReviews() {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar avaliações do localStorage
    const loadReviews = () => {
      try {
        const allReviews = JSON.parse(localStorage.getItem('serviceReviews') || '[]');
        const serviceRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
        
        console.log('DEBUG - Todas as avaliações:', allReviews);
        console.log('DEBUG - ID do usuário atual:', user?.id);
        console.log('DEBUG - Todos os serviços:', serviceRequests);
        
        // Filtrar apenas avaliações do cliente atual
        const clientReviews = allReviews.filter((review: Review) => review.clientId === user?.id);
        
        console.log('DEBUG - Avaliações do cliente:', clientReviews);
        
        // Adicionar informações do serviço e prestador
        const reviewsWithDetails = clientReviews.map((review: Review) => {
          const service = serviceRequests.find((s: any) => s.id === review.serviceId);
          return {
            ...review,
            providerName: service?.providerName || 'Prestador',
            serviceName: service?.service || 'Serviço'
          };
        });
        
        console.log('DEBUG - Avaliações com detalhes:', reviewsWithDetails);
        
        // Ordenar por data (mais recente primeiro)
        reviewsWithDetails.sort((a: Review, b: Review) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setReviews(reviewsWithDetails);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [user?.id]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando avaliações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/client/profile" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para o Perfil
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Minhas Avaliações
            </h1>
            <p className="text-lg text-gray-600">
              Histórico de todas as suas avaliações de serviços
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {reviews.length}
              </div>
              <div className="text-gray-600 text-sm">Total de Avaliações</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-gray-600 text-sm">Média de Avaliação</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <div className="text-gray-600 text-sm">Avaliações Positivas</div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não avaliou nenhum serviço. Após concluir um serviço, 
              volte aqui para deixar sua avaliação!
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Buscar Serviços
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {review.serviceName}
                    </h3>
                    <p className="text-gray-600">
                      Prestador: {review.providerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(review.date)}
                  </div>
                </div>
                
                <div className="mb-4">
                  {renderStars(review.rating)}
                </div>
                
                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t">
                  <Link
                    to={`/service/${review.serviceId}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Ver detalhes do serviço
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
