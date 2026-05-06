import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { InstitutionForm } from '../components/InstitutionForm';
import { ActivityForm } from '../components/ActivityForm';
import { Plus, Edit, Eye, Power, Search, EyeOff } from 'lucide-react';
import { Activity, Institution } from '../types';
import { api } from '../services/api';

type AdminSection = 'overview' | 'institutions' | 'activities';

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    Promise.all([api.getInstitutions(), api.getActivities()])
      .then(([inst, acts]) => {
        setInstitutions(inst);
        setActivities(acts);
      })
      .catch((err) => console.error('Falha ao carregar admin data', err));
  }, []);

  const neighborhoods = useMemo(() => {
    const unique = new Set(institutions.map((i) => i.neighborhood).filter(Boolean));
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [institutions]);

  const handleSaveInstitution = async (data: Partial<Institution>) => {
    if (editingInstitution) {
      const updated = await api.updateInstitution(editingInstitution.id, data);
      setInstitutions(institutions.map((inst) => (inst.id === updated.id ? updated : inst)));
    } else {
      const created = await api.createInstitution(data);
      setInstitutions([...institutions, created]);
    }
    setShowInstitutionForm(false);
    setEditingInstitution(null);
  };

  const handleSaveActivity = async (data: Partial<Activity>) => {
    if (editingActivity) {
      const updated = await api.updateActivity(editingActivity.id, data);
      setActivities(activities.map((act) => (act.id === updated.id ? updated : act)));
    } else {
      const created = await api.createActivity(data);
      setActivities([...activities, created]);
    }
    setShowActivityForm(false);
    setEditingActivity(null);
  };

  const handleToggleInstitutionStatus = async (id: string) => {
    const current = institutions.find((inst) => inst.id === id);
    if (!current) return;
    const nextStatus = current.status === 'Ativa' ? 'Inativa' : 'Ativa';
    const updated = await api.updateInstitutionStatus(id, nextStatus);
    setInstitutions(institutions.map((inst) => (inst.id === id ? updated : inst)));
  };

  const handleToggleActivityStatus = async (id: string) => {
    const current = activities.find((act) => act.id === id);
    if (!current) return;
    const nextStatus = current.status === 'Aberta' ? 'Encerrada' : 'Aberta';
    const updated = await api.updateActivityStatus(id, nextStatus);
    setActivities(activities.map((act) => (act.id === id ? updated : act)));
  };

  const handleEditInstitution = (institution: Institution) => {
    setEditingInstitution(institution);
    setShowInstitutionForm(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Admin" />

      <div className="flex flex-col md:flex-row pt-14 md:pt-16 pb-20 md:pb-0">
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/30 md:min-h-screen p-3 md:p-4">
          <nav className="flex md:block gap-2 md:space-y-1 overflow-x-auto">
            <button
              onClick={() => setActiveSection('overview')}
              className={`flex-shrink-0 md:w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              Visão Geral
            </button>

            <button
              onClick={() => setActiveSection('institutions')}
              className={`flex-shrink-0 md:w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'institutions'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              Instituições
            </button>

            <button
              onClick={() => setActiveSection('activities')}
              className={`flex-shrink-0 md:w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'activities'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              Atividades
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6 min-w-0">
          {activeSection === 'overview' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
                Painel Administrativo
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total de Instituições</p>
                  <p className="text-3xl font-semibold text-foreground">{institutions.length}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {institutions.filter((i) => i.status === 'Ativa').length} ativas
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total de Atividades</p>
                  <p className="text-3xl font-semibold text-foreground">{activities.length}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {activities.filter((a) => a.status === 'Aberta').length} abertas
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">Última Atualização</p>
                  <p className="text-lg font-semibold text-foreground">Hoje</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Sistema atualizado
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-foreground mb-4">Registros Recentes</h2>
                <div className="space-y-3">
                  {institutions.slice(0, 5).map((institution) => (
                    <div
                      key={institution.id}
                      className="flex items-center justify-between p-3 bg-accent/20 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{institution.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {institution.type} • {institution.neighborhood}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {institution.lastUpdate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'institutions' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Gerenciar Instituições
                </h1>
                <button
                  onClick={() => {
                    setEditingInstitution(null);
                    setShowInstitutionForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Instituição
                </button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar instituição..."
                    className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-accent/20 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Nome</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Tipo</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Bairro</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Classificação</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions
                      .filter((i) =>
                        searchQuery === '' ||
                        i.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((institution) => (
                        <tr key={institution.id} className="border-b border-border hover:bg-accent/10">
                          <td className="px-4 py-3 text-sm text-foreground">{institution.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{institution.type}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{institution.neighborhood}</td>
                          <td className="px-4 py-3 text-sm text-foreground">⭐ {institution.rating}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              institution.status === 'Ativa'
                                ? 'bg-accent/20 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {institution.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleInstitutionStatus(institution.id)}
                                className="p-1 hover:bg-accent rounded transition-colors"
                                title={institution.status === 'Ativa' ? 'Tornar invisível' : 'Tornar visível'}
                              >
                                {institution.status === 'Ativa' ? (
                                  <Eye className="w-4 h-4 text-foreground" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditInstitution(institution)}
                                className="p-1 hover:bg-accent rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-foreground" />
                              </button>
                              <button
                                onClick={() => handleToggleInstitutionStatus(institution.id)}
                                className="p-1 hover:bg-accent rounded transition-colors"
                                title={institution.status === 'Ativa' ? 'Desligar' : 'Ativar'}
                              >
                                <Power className={`w-4 h-4 ${institution.status === 'Ativa' ? 'text-accent' : 'text-muted-foreground'}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'activities' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Gerenciar Atividades
                </h1>
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setShowActivityForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Atividade
                </button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar atividade..."
                    className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="bg-accent/20 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Nome</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Instituição</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Categoria</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Horário</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Vagas</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities
                      .filter((a) =>
                        searchQuery === '' ||
                        a.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((activity) => (
                        <tr key={activity.id} className="border-b border-border hover:bg-accent/10">
                          <td className="px-4 py-3 text-sm text-foreground">{activity.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{activity.institutionName}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{activity.category}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {activity.startTime}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {activity.availableSlots}/{activity.totalSlots}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              activity.status === 'Aberta'
                                ? 'bg-accent/20 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleActivityStatus(activity.id)}
                                className="p-1 hover:bg-accent rounded transition-colors"
                                title={activity.status === 'Aberta' ? 'Tornar invisível' : 'Tornar visível'}
                              >
                                {activity.status === 'Aberta' ? (
                                  <Eye className="w-4 h-4 text-foreground" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditActivity(activity)}
                                className="p-1 hover:bg-accent rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-foreground" />
                              </button>
                              <button
                                onClick={() => handleToggleActivityStatus(activity.id)}
                                className="p-1 hover:bg-accent rounded transition-colors"
                                title={activity.status === 'Aberta' ? 'Desligar' : 'Ativar'}
                              >
                                <Power className={`w-4 h-4 ${activity.status === 'Aberta' ? 'text-accent' : 'text-muted-foreground'}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {showInstitutionForm && (
        <InstitutionForm
          mode={editingInstitution ? 'edit' : 'create'}
          initialData={editingInstitution}
          neighborhoods={neighborhoods}
          onClose={() => {
            setShowInstitutionForm(false);
            setEditingInstitution(null);
          }}
          onSave={handleSaveInstitution}
        />
      )}

      {showActivityForm && (
        <ActivityForm
          mode={editingActivity ? 'edit' : 'create'}
          initialData={editingActivity}
          institutions={institutions}
          onClose={() => {
            setShowActivityForm(false);
            setEditingActivity(null);
          }}
          onSave={handleSaveActivity}
        />
      )}
    </div>
  );
}
