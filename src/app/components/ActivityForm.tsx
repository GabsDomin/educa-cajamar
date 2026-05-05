import { useState } from 'react';
import { X } from 'lucide-react';

interface ActivityFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  mode: 'create' | 'edit';
  institutions: any[];
}

export function ActivityForm({ onClose, onSave, initialData, mode, institutions }: ActivityFormProps) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    institutionId: '',
    institutionName: '',
    category: 'Reforço Escolar',
    description: '',
    weekDays: [],
    startTime: '',
    endTime: '',
    targetAudience: '',
    ageRange: '',
    isFree: true,
    availableSlots: 0,
    totalSlots: 0,
    status: 'Aberta',
    enrollmentInfo: '',
    instructor: '',
    neighborhood: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const institution = institutions.find(i => i.id === formData.institutionId);
    onSave({
      ...formData,
      institutionName: institution?.name || '',
      neighborhood: institution?.neighborhood || ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev: any) => ({ ...prev, [name]: checkbox.checked }));
    } else if (type === 'number') {
      setFormData((prev: any) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleWeekDayToggle = (day: string) => {
    setFormData((prev: any) => {
      const weekDays = prev.weekDays.includes(day)
        ? prev.weekDays.filter((d: string) => d !== day)
        : [...prev.weekDays, day];
      return { ...prev, weekDays };
    });
  };

  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === 'create' ? 'Nova Atividade' : 'Editar Atividade'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Nome da Atividade *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Instituição *
              </label>
              <select
                name="institutionId"
                value={formData.institutionId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Selecione...</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Reforço Escolar">Reforço Escolar</option>
                <option value="Esporte">Esporte</option>
                <option value="Luta">Luta</option>
                <option value="Dança">Dança</option>
                <option value="Música">Música</option>
                <option value="Instrumentos">Instrumentos</option>
                <option value="Teatro">Teatro</option>
                <option value="Robótica">Robótica</option>
                <option value="Informática">Informática</option>
                <option value="Oficina Cultural">Oficina Cultural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Horário Início *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Horário Fim *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Público-alvo *
              </label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="Ex: Crianças"
                required
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Faixa Etária *
              </label>
              <input
                type="text"
                name="ageRange"
                value={formData.ageRange}
                onChange={handleChange}
                placeholder="Ex: 8 a 14 anos"
                required
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Vagas Disponíveis *
              </label>
              <input
                type="number"
                name="availableSlots"
                value={formData.availableSlots}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Total de Vagas *
              </label>
              <input
                type="number"
                name="totalSlots"
                value={formData.totalSlots}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Instrutor/Professor
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Aberta">Aberta</option>
                <option value="Encerrada">Encerrada</option>
                <option value="Em Breve">Em Breve</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Dias da Semana *
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleWeekDayToggle(day)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    formData.weekDays.includes(day)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent/20 text-foreground hover:bg-accent/30'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Informações de Inscrição
            </label>
            <input
              type="text"
              name="enrollmentInfo"
              value={formData.enrollmentInfo}
              onChange={handleChange}
              placeholder="Ex: Inscrições na secretaria"
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFree"
              id="isFree"
              checked={formData.isFree}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="isFree" className="text-sm text-foreground">
              Atividade gratuita
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-foreground rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              {mode === 'create' ? 'Cadastrar' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
