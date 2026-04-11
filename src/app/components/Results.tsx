import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, ArrowLeft, Download, Share2, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface Finding {
  severity: string;
  text: string;
  confidence: string;
}

interface AnalysisResult {
  id: number;
  model_name: string;
  model_category: string;
  confidence: number;
  findings: Finding[];
  recommendation: string;
  processing_time: string;
  image_path: string;
  created_at: string;
}

export function Results() {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('id');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (analysisId) {
      apiFetch(`/analyses/${analysisId}`)
        .then(setResult)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [analysisId]);

  const handleBack = () => {
    navigate(user?.type === 'doctor' ? '/doctor' : '/patient');
  };

  const handleNewAnalysis = () => {
    navigate('/select-model');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) +
      ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Carregando resultado...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Resultado não encontrado</p>
          <Button onClick={handleBack}>Voltar ao início</Button>
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
                <p className="text-sm text-gray-500">Resultados da análise</p>
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
              Baixar relatório
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">Análise concluída</h2>
          </div>
          <p className="text-gray-600">Resultados gerados em {formatDate(result.created_at)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Confiança geral</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{result.confidence}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${result.confidence}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Modelo utilizado</div>
            <div className="text-xl font-bold text-gray-900 mb-2">{result.model_name}</div>
            <div className="text-sm text-gray-600">{result.model_category}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Tempo de processamento</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{result.processing_time}</div>
            <div className="text-sm text-gray-600">Análise rápida</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Imagem analisada</h3>
            </div>
            <div className="p-6">
              {result.image_path ? (
                <img
                  src={`http://localhost:8000${result.image_path}`}
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

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Principais achados</h3>
              <div className="space-y-3">
                {result.findings?.map((finding, idx) => (
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
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">Recomendação médica</h4>
                  <p className="text-sm text-amber-800">{result.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Próximos passos</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Agende uma consulta com {result.model_category?.toLowerCase() === 'dermatologia' ? 'dermatologista' : 'especialista'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Leve este relatório para a consulta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Monitore quaisquer mudanças na região analisada</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleBack}>
            Voltar ao início
          </Button>
          <Button onClick={handleNewAnalysis}>
            Nova análise
          </Button>
        </div>
      </main>
    </div>
  );
}
