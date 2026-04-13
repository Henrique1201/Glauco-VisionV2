import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, ArrowLeft, Brain, Eye, Heart, Bone, Stethoscope, Scan } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Scan, Stethoscope, Eye, Heart, Bone, Brain,
};

interface AIModel {
  id: string;
  name: string;
  category: string;
  description: string;
  accuracy: string;
  color_gradient: string;
  icon_name: string;
}

export function SelectModel() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/models').then(setModels).catch(console.error);
  }, []);

  const handleContinue = () => {
    if (selectedModel) {
      navigate(`/upload?model=${selectedModel}`);
    }
  };

  const handleBack = () => {
    navigate(user?.type === 'doctor' ? '/doctor' : '/patient');
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
                <p className="text-sm text-gray-500">Seleção de modelo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Escolha o modelo de IA</h2>
          <p className="text-gray-600">Selecione o modelo especializado para o tipo de análise desejada</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {models.map((model) => {
            const Icon = ICON_MAP[model.icon_name] || Brain;
            const isSelected = selectedModel === model.id;

            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`text-left bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
                  isSelected ? 'border-blue-600 shadow-lg' : 'border-gray-200'
                }`}
              >
                <div className={`bg-gradient-to-br ${model.color_gradient} p-6 rounded-t-xl`}>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{model.name}</h3>
                  <div className="text-white/90 text-sm">{model.category}</div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4 min-h-[3rem]">{model.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Precisão</div>
                    <div className="font-semibold text-green-600">{model.accuracy}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!selectedModel}
            size="lg"
          >
            Continuar para upload
          </Button>
        </div>
      </main>
    </div>
  );
}
