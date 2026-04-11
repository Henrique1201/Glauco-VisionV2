import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, Users, FileText, TrendingUp, LogOut, Brain } from 'lucide-react';

interface DashboardStats {
  active_patients: number;
  analyses_today: number;
  average_accuracy: string;
  active_models: number;
}

interface RecentAnalysis {
  id: number;
  patient_name: string;
  model_category: string;
  model_name: string;
  confidence: number;
  created_at: string;
}

export function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);

  useEffect(() => {
    apiFetch('/dashboard/stats').then(setStats).catch(console.error);
    apiFetch('/analyses?limit=3').then(setRecentAnalyses).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statCards = [
    { label: 'Pacientes ativos', value: stats?.active_patients ?? '—', icon: Users, color: 'bg-blue-500' },
    { label: 'Análises hoje', value: stats?.analyses_today ?? '—', icon: FileText, color: 'bg-green-500' },
    { label: 'Precisão média', value: stats?.average_accuracy ?? '—', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Modelos ativos', value: stats?.active_models ?? '—', icon: Brain, color: 'bg-orange-500' }
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Hoje, ${time}` : `${d.toLocaleDateString('pt-BR')}, ${time}`;
  };

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
          {statCards.map((stat) => (
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
            {recentAnalyses.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma análise realizada ainda</p>
            )}
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{analysis.patient_name}</div>
                  <div className="text-sm text-gray-600">{analysis.model_category} · {analysis.model_name}</div>
                </div>
                <div className="text-right mr-6">
                  <div className="font-semibold text-green-600">{analysis.confidence}%</div>
                  <div className="text-sm text-gray-500">{formatDate(analysis.created_at)}</div>
                </div>
                <Button size="sm" onClick={() => navigate(`/analysis/${analysis.id}`)}>Ver detalhes</Button>
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
