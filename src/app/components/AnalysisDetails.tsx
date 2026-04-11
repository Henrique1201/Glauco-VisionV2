import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, ArrowLeft, Download, Share2, AlertCircle, User, Calendar, Brain, TrendingUp } from 'lucide-react';

interface Finding {
  severity: string;
  text: string;
  confidence: string;
}

interface AnalysisDetail {
  id: number;
  patient_name: string;
  patient_cpf: string;
  patient_age: string;
  model_name: string;
  model_category: string;
  confidence: number;
  findings: Finding[];
  recommendation: string;
  processing_time: string;
  image_path: string;
  created_at: string;
}

export function AnalysisDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiFetch(`/analyses/${id}`)
        .then(setAnalysis)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleBack = () => {
    navigate('/all-analyses');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Carregando detalhes...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Análise não encontrada</p>
          <Button onClick={handleBack}>Voltar</Button>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-gray-500">Detalhes da análise</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do paciente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Nome</div>
                    <div className="font-medium text-gray-900">{analysis.patient_name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">CPF</div>
                    <div className="font-medium text-gray-900">{analysis.patient_cpf || '—'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Idade</div>
                    <div className="font-medium text-gray-900">{analysis.patient_age || '—'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Data da análise</div>
                    <div className="font-medium text-gray-900">{formatDate(analysis.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Imagem analisada</h3>
              </div>
              <div className="p-6">
                {analysis.image_path ? (
                  <img
                    src={`http://localhost:8000${analysis.image_path}`}
                    alt="Imagem analisada"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    Imagem não disponível
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Confiança geral</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analysis.confidence}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analysis.confidence}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Modelo utilizado</div>
                  <div className="font-semibold text-gray-900">{analysis.model_name}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">{analysis.model_category}</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tempo de processamento</div>
                  <div className="font-semibold text-gray-900">{analysis.processing_time}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Principais achados</h3>
              <div className="space-y-3">
                {analysis.findings?.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      finding.severity === 'high' ? 'text-red-600' :
                      finding.severity === 'medium' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 mb-1">{finding.text}</div>
                      <div className="text-xs text-gray-600">Confiança: {finding.confidence}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h4 className="font-semibold text-amber-900 mb-2">Recomendação</h4>
              <p className="text-sm text-amber-800">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
