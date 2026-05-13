import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Star } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useUser } from "../context/UserContext";

export function ReviewService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { serviceRequests } = useSimulation();
  const { user } = useUser();
  const service = serviceRequests.find(s => s.id === id);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!service || service.clientId !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Serviço não encontrado</h1>
          <Link to="/client/profile" className="text-green-600 font-bold hover:underline">
            Voltar para o perfil
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Por favor, selecione uma avaliação em estrelas");
      return;
    }
    
    // Salvar avaliação no localStorage
    const reviews = JSON.parse(localStorage.getItem('serviceReviews') || '[]');
    const newReview = {
      id: Date.now().toString(),
      serviceId: id,
      clientId: user?.id,
      clientName: user?.name,
      rating,
      comment,
      date: new Date().toISOString(),
      providerId: service?.providerId
    };
    
    console.log('DEBUG - Nova avaliação a ser salva:', newReview);
    console.log('DEBUG - Avaliações existentes:', reviews);
    
    reviews.push(newReview);
    localStorage.setItem('serviceReviews', JSON.stringify(reviews));
    
    console.log('DEBUG - Avaliações após salvar:', reviews);
    console.log('DEBUG - Verificando se foi salvo:', JSON.parse(localStorage.getItem('serviceReviews') || '[]'));
    
    // Atualizar status do serviço para avaliado e salvar review no serviço
    const services = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const serviceIndex = services.findIndex((s: any) => s.id === id);
    if (serviceIndex !== -1) {
      services[serviceIndex].status = 'completed';
      services[serviceIndex].reviewed = true;
      services[serviceIndex].clientReview = {
        rating,
        comment,
        date: new Date().toISOString(),
        clientName: user?.name
      };
      localStorage.setItem('serviceRequests', JSON.stringify(services));
      
      console.log('DEBUG - Serviço atualizado com avaliação:', services[serviceIndex]);
    }
    
    alert("Avaliação realizada com sucesso! Obrigado pelo feedback.");
    navigate("/client/reviews");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to={`/service/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para serviço
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avaliar Serviço</h1>
          <p className="text-gray-600">
            Sua opinião é muito importante para ajudar outros clientes
          </p>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informações do Serviço</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Prestador</p>
              <p className="font-semibold text-gray-900">{service.providerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo de Serviço</p>
              <p className="font-semibold text-gray-900">{service.serviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="font-semibold text-gray-900">{service.description}</p>
            </div>
            {service.proposedValue && (
              <div>
                <p className="text-sm text-gray-600">Valor</p>
                <p className="font-semibold text-gray-900">{service.proposedValue}</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Como você avalia este serviço? *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {rating === 0 && "Selecione uma avaliação"}
                {rating === 1 && "⭐ Muito Insatisfeito"}
                {rating === 2 && "⭐⭐ Insatisfeito"}
                {rating === 3 && "⭐⭐⭐ Regular"}
                {rating === 4 && "⭐⭐⭐⭐ Satisfeito"}
                {rating === 5 && "⭐⭐⭐⭐⭐ Muito Satisfeito"}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Comentário *
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Conte-nos mais sobre sua experiência com este prestador
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={6}
                placeholder="Descreva sua experiência... O prestador foi pontual? O trabalho ficou bem feito? Você recomendaria?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Mínimo de 20 caracteres ({comment.length}/20)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                <span className="font-semibold">Dica:</span> Avaliações honestas e detalhadas 
                ajudam outros clientes a tomar melhores decisões e incentivam os prestadores 
                a manterem um serviço de qualidade.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/service/${id}`)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={rating === 0 || comment.length < 20}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Enviar Avaliação
              </button>
            </div>
          </div>
        </form>

        {/* Privacy Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sua avaliação será pública e ficará visível no perfil do prestador
          </p>
        </div>
      </div>
    </div>
  );
}
