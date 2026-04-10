import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, Users, FileText, TrendingUp, LogOut, Brain } from 'lucide-react';

export function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { label: 'Pacientes ativos', value: '48', icon: Users, color: 'bg-blue-500' },
    { label: 'Análises hoje', value: '12', icon: FileText, color: 'bg-green-500' },
    { label: 'Precisão média', value: '94%', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Modelos ativos', value: '6', icon: Brain, color: 'bg-orange-500' }
  ];

  const recentAnalyses = [
    { patient: 'Maria Silva', condition: 'Dermatologia', model: 'SkinNet v2', confidence: '96%', date: 'Hoje, 14:30' },
    { patient: 'João Santos', condition: 'Pneumologia', model: 'ChestX-Ray AI', confidence: '89%', date: 'Hoje, 13:15' },
    { patient: 'Ana Costa', condition: 'Oftalmologia', model: 'RetinalScan', confidence: '92%', date: 'Hoje, 11:45' }
  ];

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
              <p className="text-sm text-gray-500">Portal Médico</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium text-gray-900">Dr. {user?.name}</div>
              <div className="text-sm text-gray-500">Médico</div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta, Dr. {user?.name}</h2>
          <p className="text-gray-600">Aqui está um resumo da sua atividade</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Análises recentes</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/all-analyses')}>Ver todas</Button>
          </div>
          <div className="space-y-4">
            {recentAnalyses.map((analysis, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{analysis.patient}</div>
                  <div className="text-sm text-gray-600">{analysis.condition} · {analysis.model}</div>
                </div>
                <div className="text-right mr-6">
                  <div className="font-semibold text-green-600">{analysis.confidence}</div>
                  <div className="text-sm text-gray-500">{analysis.date}</div>
                </div>
                <Button size="sm" onClick={() => navigate('/analysis/1')}>Ver detalhes</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Nova análise com IA</h3>
          <p className="text-blue-100 mb-6">Analise imagens médicas com nossos modelos de inteligência artificial</p>
          <Button
            onClick={() => navigate('/select-model')}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Iniciar nova análise
          </Button>
        </div>
      </main>
    </div>
  );
}
