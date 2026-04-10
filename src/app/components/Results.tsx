import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, ArrowLeft, Download, Share2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import resultImage from 'figma:asset/0250d7a5e5111f510b07c5bb1fed6a8eb1f5aeb6.png';

export function Results() {
  const [searchParams] = useSearchParams();
  const modelId = searchParams.get('model');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(user?.type === 'doctor' ? '/doctor' : '/patient');
  };

  const handleNewAnalysis = () => {
    navigate('/select-model');
  };

  const findings = [
    { severity: 'high', text: 'Lesão pigmentada assimétrica detectada', confidence: '94%' },
    { severity: 'medium', text: 'Bordas irregulares presentes', confidence: '89%' },
    { severity: 'low', text: 'Variação de cor observada', confidence: '76%' }
  ];

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
          <p className="text-gray-600">Resultados gerados em 10 de abril de 2026 às 15:34</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Confiança geral</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">94%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Modelo utilizado</div>
            <div className="text-xl font-bold text-gray-900 mb-2">SkinNet v2</div>
            <div className="text-sm text-gray-600">Análise dermatológica</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Tempo de processamento</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">1.8s</div>
            <div className="text-sm text-gray-600">Análise rápida</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Principais achados</h3>
              <div className="space-y-3">
                {findings.map((finding, idx) => {
                  const severityColors = {
                    high: 'bg-red-100 text-red-800 border-red-200',
                    medium: 'bg-orange-100 text-orange-800 border-orange-200',
                    low: 'bg-blue-100 text-blue-800 border-blue-200'
                  };

                  return (
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
                  );
                })}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">Recomendação médica</h4>
                  <p className="text-sm text-amber-800">
                    Esta análise é uma ferramenta de suporte ao diagnóstico.
                    Recomenda-se consulta com um dermatologista para avaliação
                    clínica completa e confirmação do diagnóstico.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Próximos passos</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Agende uma consulta com dermatologista</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Leve este relatório para a consulta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Monitore quaisquer mudanças na lesão</span>
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
