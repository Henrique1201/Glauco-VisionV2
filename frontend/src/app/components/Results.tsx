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



        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-2xl mx-auto mb-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Diagnóstico</h3>
          
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Resultado da IA</div>
              <div className={`text-4xl font-extrabold ${result.findings?.[0]?.severity === 'high' || result.confidence > 70 ? 'text-blue-700' : 'text-green-600'}`}>
                {result.findings && result.findings.length > 0 ? "Glaucoma" : "Normal"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Confiança</div>
                <div className="text-2xl font-bold text-gray-900">{result.confidence}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Processamento</div>
                <div className="text-2xl font-bold text-gray-900">{result.processing_time}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={handleBack}>
            Voltar ao início
          </Button>
          <Button size="lg" onClick={handleNewAnalysis}>
            Nova análise
          </Button>
        </div>
      </main>
    </div>
  );
}
