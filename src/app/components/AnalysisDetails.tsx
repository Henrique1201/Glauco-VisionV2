import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, ArrowLeft, Download, Share2, AlertCircle, User, Calendar, Brain, TrendingUp } from 'lucide-react';
import resultImage from 'figma:asset/0250d7a5e5111f510b07c5bb1fed6a8eb1f5aeb6.png';

const analysisData: Record<string, any> = {
  '1': {
    patient: 'Maria Silva',
    cpf: '123.456.789-00',
    age: '45 anos',
    condition: 'Dermatologia',
    model: 'SkinNet v2',
    confidence: '96%',
    date: '10 de abril de 2026',
    time: '14:30',
    findings: [
      { severity: 'high', text: 'Lesão pigmentada assimétrica detectada', confidence: '96%' },
      { severity: 'medium', text: 'Bordas irregulares presentes', confidence: '89%' },
      { severity: 'low', text: 'Variação de cor observada', confidence: '76%' }
    ],
    recommendation: 'Esta análise sugere a necessidade de avaliação dermatológica presencial. Recomenda-se biópsia para confirmação diagnóstica.',
    processingTime: '1.8s'
  }
};

export function AnalysisDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const analysis = analysisData[id || '1'] || analysisData['1'];

  const handleBack = () => {
    navigate('/all-analyses');
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
                    <div className="font-medium text-gray-900">{analysis.patient}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">CPF</div>
                    <div className="font-medium text-gray-900">{analysis.cpf}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Idade</div>
                    <div className="font-medium text-gray-900">{analysis.age}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Data da análise</div>
                    <div className="font-medium text-gray-900">{analysis.date} às {analysis.time}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Imagem analisada</h3>
              </div>
              <div className="p-6">
                <img
                  src={resultImage}
                  alt="Imagem analisada"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Confiança geral</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analysis.confidence}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: analysis.confidence }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Modelo utilizado</div>
                  <div className="font-semibold text-gray-900">{analysis.model}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">{analysis.condition}</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tempo de processamento</div>
                  <div className="font-semibold text-gray-900">{analysis.processingTime}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Principais achados</h3>
              <div className="space-y-3">
                {analysis.findings.map((finding: any, idx: number) => (
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
