import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Activity, ArrowLeft, Search, Filter, FileText, Calendar } from 'lucide-react';

interface AnalysisItem {
  id: number;
  patient_name: string;
  patient_cpf: string;
  model_category: string;
  model_name: string;
  confidence: number;
  created_at: string;
  status: string;
}

export function AllAnalyses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (filterCondition !== 'all') params.set('condition', filterCondition);
    const qs = params.toString();

    apiFetch(`/analyses${qs ? `?${qs}` : ''}`)
      .then(setAnalyses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalyses();
  }, [filterCondition]);

  useEffect(() => {
    const timer = setTimeout(fetchAnalyses, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleBack = () => {
    navigate(user?.type === 'doctor' ? '/doctor' : '/patient');
  };

  const conditions = ['all', 'Dermatologia', 'Pneumologia', 'Oftalmologia', 'Cardiologia', 'Ortopedia', 'Neurologia'];

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AVICENA</h1>
                <p className="text-sm text-gray-500">Todas as análises</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de análises</h2>
          <p className="text-gray-600">Visualize e gerencie todas as análises realizadas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por paciente ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition === 'all' ? 'Todas as especialidades' : condition}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Paciente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">CPF</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Especialidade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Modelo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Confiança</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data/Hora</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analyses.map((analysis) => {
                  const { date, time } = formatDateTime(analysis.created_at);
                  return (
                    <tr key={analysis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{analysis.patient_name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{analysis.patient_cpf || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {analysis.model_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{analysis.model_name}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">{analysis.confidence}%</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{date} às {time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                        >
                          Ver detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && analyses.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma análise encontrada</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {analyses.length} análise{analyses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </main>
    </div>
  );
}
