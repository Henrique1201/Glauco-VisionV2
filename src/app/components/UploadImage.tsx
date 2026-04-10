import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Activity, ArrowLeft, Upload, X, CheckCircle2 } from 'lucide-react';
import uploadImage from 'figma:asset/253373390eec7f1820b22a9c6e5785b9c1ec64f7.png';

export function UploadImage() {
  const [searchParams] = useSearchParams();
  const modelId = searchParams.get('model');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    navigate(`/results?model=${modelId}`);
  };

  const handleBack = () => {
    navigate('/select-model');
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
                <p className="text-sm text-gray-500">Upload de imagem</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Envie a imagem para análise</h2>
          <p className="text-gray-600">Faça upload da imagem médica que deseja analisar</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Arraste a imagem aqui
                  </h3>
                  <p className="text-gray-600 mb-4">ou clique para selecionar</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG até 10MB</p>
                </label>
              </div>
            ) : (
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full h-auto" />
                  <button
                    onClick={handleRemove}
                    className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{selectedFile?.name}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? 'Analisando...' : 'Analisar imagem'}
              </Button>
              {selectedFile && !uploading && (
                <>
                  <input
                    type="file"
                    id="file-upload-change"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-upload-change" className="block">
                    <Button variant="outline" className="w-full" type="button" asChild>
                      <span>Escolher outra imagem</span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Diretrizes para upload</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-blue-600">1</span>
                  </div>
                  <span>Certifique-se de que a imagem está nítida e bem iluminada</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-blue-600">2</span>
                  </div>
                  <span>A área de interesse deve estar claramente visível</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-blue-600">3</span>
                  </div>
                  <span>Remova informações pessoais identificáveis quando possível</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-blue-600">4</span>
                  </div>
                  <span>Formatos aceitos: JPEG, PNG com até 10MB</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Privacidade e segurança</h4>
              <p className="text-sm text-blue-800">
                Suas imagens são processadas de forma segura e confidencial.
                Os dados são criptografados e não são compartilhados com terceiros.
              </p>
            </div>

            <img
              src={uploadImage}
              alt="Upload illustration"
              className="w-full rounded-xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
