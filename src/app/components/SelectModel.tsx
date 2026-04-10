import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, ArrowLeft, Brain, Eye, Heart, Bone, Stethoscope, Scan } from 'lucide-react';

const models = [
  {
    id: 'skinnet',
    name: 'SkinNet v2',
    category: 'Dermatologia',
    description: 'Análise de lesões de pele, melanoma e condições dermatológicas',
    icon: Scan,
    accuracy: '96%',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'chestxray',
    name: 'ChestX-Ray AI',
    category: 'Pneumologia',
    description: 'Detecção de pneumonia, tuberculose e outras condições pulmonares',
    icon: Stethoscope,
    accuracy: '94%',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'retinalscan',
    name: 'RetinalScan',
    category: 'Oftalmologia',
    description: 'Diagnóstico de retinopatia diabética e degeneração macular',
    icon: Eye,
    accuracy: '93%',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'cardioai',
    name: 'CardioAI',
    category: 'Cardiologia',
    description: 'Análise de ECG e detecção de arritmias cardíacas',
    icon: Heart,
    accuracy: '92%',
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'bonefracture',
    name: 'BoneFracture AI',
    category: 'Ortopedia',
    description: 'Detecção de fraturas e anomalias ósseas em raio-X',
    icon: Bone,
    accuracy: '95%',
    color: 'from-gray-600 to-gray-800'
  },
  {
    id: 'neuralscan',
    name: 'NeuralScan',
    category: 'Neurologia',
    description: 'Análise de ressonância magnética cerebral e detecção de anomalias',
    icon: Brain,
    accuracy: '91%',
    color: 'from-indigo-500 to-purple-600'
  }
];

export function SelectModel() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
            const Icon = model.icon;
            const isSelected = selectedModel === model.id;

            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`text-left bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
                  isSelected ? 'border-blue-600 shadow-lg' : 'border-gray-200'
                }`}
              >
                <div className={`bg-gradient-to-br ${model.color} p-6 rounded-t-xl`}>
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
