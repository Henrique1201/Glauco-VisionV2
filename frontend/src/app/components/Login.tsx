import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { IdCard, Lock, User } from 'lucide-react';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('doctor');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(document, password, userType);
      } else {
        await register(name, document, password, userType);
      }
      navigate(userType === 'doctor' ? '/doctor' : '/patient');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const documentPlaceholder = userType === 'doctor' ? 'Digite seu CRM' : 'Digite seu CPF';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a5f] p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#f5f1e8] rounded-3xl p-10 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 12V52M12 32H52" stroke="#1e3a5f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32 12C32 12 28 18 28 24C28 27.31 30.69 30 34 30C37.31 30 40 27.31 40 24C40 18 36 12 36 12" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M42 22C42 22 46 25 50 28C52.5 29.5 53 32.5 51 34.5C49 36.5 46 36 44 34C40 30 38 26 38 26" stroke="#4a7c59" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <ellipse cx="47" cy="28" rx="2" ry="3" transform="rotate(-30 47 28)" fill="#4a7c59"/>
            </svg>
            <h1 className="text-4xl font-bold text-[#1e3a5f] tracking-wide" style={{ fontFamily: "'Monomakh Unicode', serif" }}>
              AVICENA
            </h1>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUserType('doctor')}
              className={`flex-1 py-3 px-6 rounded-full transition-all font-medium ${
                userType === 'doctor'
                  ? 'bg-[#1e3a5f] text-white shadow-lg'
                  : 'bg-[#e0ddd4] text-[#7a7a7a] hover:bg-[#d5d2c9]'
              }`}
            >
              Médico
            </button>
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={`flex-1 py-3 px-6 rounded-full transition-all font-medium ${
                userType === 'patient'
                  ? 'bg-[#1e3a5f] text-white shadow-lg'
                  : 'bg-[#e0ddd4] text-[#7a7a7a] hover:bg-[#d5d2c9]'
              }`}
            >
              Paciente
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="w-full pl-12 pr-4 py-6 bg-[#e0ddd4] border-0 rounded-2xl text-[#1e3a5f] placeholder:text-[#9a9a9a] focus-visible:ring-2 focus-visible:ring-[#1e3a5f]"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                <IdCard className="w-5 h-5" />
              </div>
              <Input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder={documentPlaceholder}
                required
                className="w-full pl-12 pr-4 py-6 bg-[#e0ddd4] border-0 rounded-2xl text-[#1e3a5f] placeholder:text-[#9a9a9a] focus-visible:ring-2 focus-visible:ring-[#1e3a5f]"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="w-full pl-12 pr-4 py-6 bg-[#e0ddd4] border-0 rounded-2xl text-[#1e3a5f] placeholder:text-[#9a9a9a] focus-visible:ring-2 focus-visible:ring-[#1e3a5f]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-2xl mt-6 font-medium text-lg shadow-lg"
            >
              {loading ? (isLogin ? 'Entrando...' : 'Cadastrando...') : (isLogin ? 'Entrar' : 'Cadastrar')}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#1e3a5f] hover:underline text-sm font-medium"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
