import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, FileText, Clock, Brain, LogOut } from 'lucide-react';
import examinationImage from 'figma:asset/cfe946d7a76a6d1ceec0916780dfe5c8dcf6abc3.png';

interface MyAnalysis {
  id: number;
  model_category: string;
  model_name: string;
  confidence: number;
  created_at: string;
  status: string;
}

export function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myAnalyses, setMyAnalyses] = useState<MyAnalysis[]>([]);

  useEffect(() => {
    apiFetch('/analyses').then(setMyAnalyses).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusLabel = (s: string) => s === 'completed' ? 'Concluído' : s;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AVICENA</h1>
              <p className="text-sm text-gray-500">Portal do Paciente</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-500">Paciente</div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Olá, {user?.name}</h2>
          <p className="text-gray-600">Gerencie suas análises e diagnósticos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl overflow-hidden">
              <div className="p-8 text-white">
                <h3 className="text-3xl font-bold mb-3">Diagnóstico assistido por IA</h3>
                <p className="text-blue-100 mb-6 text-lg">
                  Obtenha análises precisas de imagens médicas usando nossos modelos de inteligência artificial
                </p>
                <Button
                  onClick={() => navigate('/select-model')}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Iniciar nova análise
                </Button>
              </div>
              <div className="px-8 pb-8">
                <img
                  src={examinationImage}
                  alt="Análise médica"
                  className="w-full rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{myAnalyses.length}</div>
                  <div className="text-sm text-gray-600">Análises realizadas</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">~2min</div>
                  <div className="text-sm text-gray-600">Tempo médio de análise</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Modelos disponíveis</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Minhas análises</h3>
          <div className="space-y-4">
            {myAnalyses.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma análise realizada ainda</p>
            )}
            {myAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Análise {analysis.model_category?.toLowerCase()}</div>
                    <div className="text-sm text-gray-600">{analysis.model_name} · {formatDate(analysis.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{analysis.confidence}%</div>
                    <div className="text-sm text-gray-500">{statusLabel(analysis.status)}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/analysis/${analysis.id}`)}>Ver resultado</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
