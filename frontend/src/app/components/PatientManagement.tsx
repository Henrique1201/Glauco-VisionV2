import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, apiFetch } from '../context/AuthContext';
import { Button } from './ui/button';
import { Users, ArrowLeft, Search, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  cpf: string;
  age: string | null;
  phone: string | null;
  doctor_id: number;
}

export function PatientManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for Create/Edit Modal or Inline form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  // Form values
  const [formData, setFormData] = useState({ name: '', cpf: '', age: '', phone: '' });

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/patients');
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingPatient(null);
    setFormData({ name: '', cpf: '', age: '', phone: '' });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({ 
      name: patient.name, 
      cpf: patient.cpf, 
      age: patient.age || '', 
      phone: patient.phone || '' 
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este paciente? Esta ação apagará todas as análises dele.')) return;
    try {
      await apiFetch(`/patients/${id}`, { method: 'DELETE' });
      setPatients(patients.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir paciente.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        // Edit 
        await apiFetch(`/patients/${editingPatient.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        // Create
        await apiFetch('/patients', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsFormOpen(false);
      loadPatients();
    } catch (err: any) {
      console.error(err);
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/doctor')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gerenciamento de Pacientes</h1>
                <p className="text-sm text-gray-500">Listagem e cadastro</p>
              </div>
            </div>
          </div>
          <Button onClick={handleOpenCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {isFormOpen && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editingPatient ? 'Editar Paciente' : 'Novo Paciente'}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome completo *</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">CPF *</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Idade</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Check className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Carregando...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum paciente encontrado.</td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.cpf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditForm(patient)} className="text-blue-600 hover:text-blue-900 mr-2">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(patient.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
