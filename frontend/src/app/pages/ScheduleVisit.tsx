import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Calendar, Clock, MapPin, User, AlertCircle, CheckCircle } from "lucide-react";
import { mockServiceRequests } from "../data/mockData";

export function ScheduleVisit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const request = mockServiceRequests.find((req) => req.id === id);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    address: request?.address || "",
    notes: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Serviço não encontrado</h1>
          <Link to="/search" className="text-green-600 hover:underline">
            Voltar para busca
          </Link>
        </div>
      </div>
    );
  }

  // Check if visit is already scheduled
  if (request.visitScheduled) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/service/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para serviço
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Visita Já Agendada</h1>
              <p className="text-gray-600">Esta solicitação já possui uma visita agendada</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-green-900 mb-3">Detalhes da Visita</h3>
              <div className="flex items-center gap-3 text-green-800">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(request.visitScheduled.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-green-800">
                <Clock className="w-5 h-5" />
                <span>{request.visitScheduled.time}</span>
              </div>
              <div className="flex items-start gap-3 text-green-800">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{request.visitScheduled.address}</span>
              </div>
              {request.visitScheduled.notes && (
                <div className="pt-3 border-t border-green-200">
                  <p className="text-sm text-green-900">
                    <strong>Observações:</strong> {request.visitScheduled.notes}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-green-200">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  request.visitScheduled.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : request.visitScheduled.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.visitScheduled.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  Status: {
                    request.visitScheduled.status === 'confirmed' ? 'Confirmada' :
                    request.visitScheduled.status === 'pending' ? 'Pendente' :
                    request.visitScheduled.status === 'completed' ? 'Concluída' :
                    'Cancelada'
                  }
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to={`/service/${id}`}
                className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </Link>
              <button
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                onClick={() => {
                  if (confirm("Tem certeza que deseja cancelar esta visita?")) {
                    alert("Visita cancelada!");
                    navigate(`/service/${id}`);
                  }
                }}
              >
                Cancelar Visita
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Selecione uma data";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "A data não pode ser no passado";
      }
    }

    if (!formData.time) {
      newErrors.time = "Selecione um horário";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Informe o endereço";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // In real app, would send to backend
    alert("Visita agendada com sucesso! O prestador será notificado.");
    navigate(`/service/${id}`);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agendar Visita</h1>
          <p className="text-gray-600">
            Agende uma visita para o prestador avaliar o serviço presencialmente
          </p>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informações do Serviço</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Prestador</p>
                <p className="font-semibold text-gray-900">{request.providerName}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo de Serviço</p>
              <p className="font-semibold text-gray-900">{request.serviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="text-gray-900">{request.description}</p>
            </div>
          </div>
        </div>

        {/* Scheduling Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-6">Dados do Agendamento</h2>
          
          <div className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Data da Visita *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  min={minDate}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Horário *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione um horário</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                Horários disponíveis: 08:00 às 18:00
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Endereço *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  placeholder="Rua, número, bairro, cidade..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                placeholder="Informações adicionais como portão, interfone, pontos de referência..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          {/* Info Alert */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>O prestador receberá uma notificação com os detalhes da visita</li>
                  <li>Certifique-se de estar disponível no horário agendado</li>
                  <li>Você pode cancelar ou reagendar até 24h antes da visita</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <Link
              to={`/service/${id}`}
              className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
