import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { api } from '../services/api';
import {
  School,
  Building2,
  Activity as ActivityIcon,
  Star,
  TrendingUp,
  MapPin,
  Users,
  Award,
  Search,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Institution, Neighborhood } from '../types';

export function AnalyticsPage() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  useEffect(() => {
    Promise.all([api.getInstitutions(), api.getActivities(), api.getNeighborhoods()])
      .then(([inst, acts, hoods]) => {
        setInstitutions(inst);
        setActivities(acts);
        setNeighborhoods(hoods);
      })
      .catch((err) => console.error('Falha ao carregar analytics', err));
  }, []);

  const filteredInstitutions = selectedNeighborhood === 'Todos'
    ? institutions
    : institutions.filter(i => i.neighborhood === selectedNeighborhood);

  const filteredActivities = selectedNeighborhood === 'Todos'
    ? activities
    : activities.filter(a => a.neighborhood === selectedNeighborhood);

  const searchedInstitutions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredInstitutions;
    return filteredInstitutions.filter((i) =>
      [i.name, i.neighborhood, i.type].some((v) => v.toLowerCase().includes(q))
    );
  }, [filteredInstitutions, searchQuery]);

  const searchedActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredActivities;
    return filteredActivities.filter((a) =>
      [a.name, a.neighborhood, a.category, a.institutionName].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [filteredActivities, searchQuery]);

  const totalSchools = searchedInstitutions.filter((i) => i.type === 'Escola').length;
  const totalInstitutions = searchedInstitutions.length;
  const totalActiveActivities = searchedActivities.filter((a) => a.status === 'Aberta').length;
  const averageRating = searchedInstitutions.length > 0 ? (
    searchedInstitutions.reduce((sum, i) => sum + i.rating, 0) / searchedInstitutions.length
  ).toFixed(1) : '0.0';
  const freeActivities = searchedActivities.filter((a) => a.isFree).length;
  const freePercentage = searchedActivities.length > 0 ? ((freeActivities / searchedActivities.length) * 100).toFixed(0) : '0';

  const institutionsByType = [
    { name: 'Escola', value: searchedInstitutions.filter((i) => i.type === 'Escola').length, color: '#3b82f6' },
    { name: 'Cultural', value: searchedInstitutions.filter((i) => i.type === 'Cultural').length, color: '#8b5cf6' },
    { name: 'Esporte', value: searchedInstitutions.filter((i) => i.type === 'Esporte').length, color: '#10b981' },
    { name: 'Oficina', value: searchedInstitutions.filter((i) => i.type === 'Oficina').length, color: '#f59e0b' },
    { name: 'Outros', value: searchedInstitutions.filter((i) => !['Escola', 'Cultural', 'Esporte', 'Oficina'].includes(i.type)).length, color: '#ec4899' }
  ];

  const activitiesByCategory = [
    { category: 'Reforço Escolar', count: searchedActivities.filter((a) => a.category === 'Reforço Escolar').length },
    { category: 'Esporte', count: searchedActivities.filter((a) => a.category === 'Esporte' || a.category === 'Luta').length },
    { category: 'Música', count: searchedActivities.filter((a) => a.category === 'Música' || a.category === 'Instrumentos').length },
    { category: 'Dança', count: searchedActivities.filter((a) => a.category === 'Dança').length },
    { category: 'Outros', count: searchedActivities.filter((a) => !['Reforço Escolar', 'Esporte', 'Luta', 'Música', 'Instrumentos', 'Dança'].includes(a.category)).length }
  ];

  const neighborhoodData = neighborhoods.map((n) => ({
    name: n.name,
    escolas: n.schoolCount,
    instituicoes: n.institutionCount - n.schoolCount,
    atividades: n.activityCount,
    cobertura: n.coverageIndex
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Analítico" />

      <div className="pt-20 px-6 pb-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Painel Analítico
          </h1>
          <p className="text-muted-foreground">
            Indicadores, KPIs e dashboards sobre educação e cultura em Cajamar
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar bairro, instituição ou atividade..."
              className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="Todos">Todos os Bairros</option>
              {neighborhoods.map(neighborhood => (
                <option key={neighborhood.name} value={neighborhood.name}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Total de Escolas"
            value={totalSchools}
            Icon={School}
            colorClass="bg-primary"
            trend="up"
            trendValue="+2 este ano"
          />

          <KPICard
            label="Total de Instituições"
            value={totalInstitutions}
            Icon={Building2}
            colorClass="bg-secondary"
            trend="up"
            trendValue="+5 este ano"
          />

          <KPICard
            label="Atividades Ativas"
            value={totalActiveActivities}
            Icon={ActivityIcon}
            colorClass="bg-accent"
            trend="stable"
            trendValue="Estável"
          />

          <KPICard
            label="Média de Classificação"
            value={averageRating}
            Icon={Star}
            colorClass="bg-highlight"
            trend="up"
            trendValue="+0.2 este ano"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Instituições por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={institutionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {institutionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Atividades por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activitiesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f2e',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    color: '#f0f4f8'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-accent p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atividades Gratuitas</p>
                <p className="text-2xl font-semibold text-foreground">{freePercentage}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{freeActivities} de {searchedActivities.length} atividades</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bairro com Mais Escolas</p>
                <p className="text-lg font-semibold text-foreground">Centro</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">6 escolas cadastradas</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-secondary p-2 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Melhor Avaliada</p>
                <p className="text-lg font-semibold text-foreground">Projeto Crescer</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">4.8 de classificação</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Cobertura Educacional por Bairro</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={neighborhoodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #2d3748',
                  borderRadius: '8px',
                  color: '#f0f4f8'
                }}
              />
              <Legend />
              <Bar dataKey="escolas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Escolas" />
              <Bar dataKey="instituicoes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Instituições" />
              <Bar dataKey="atividades" fill="#10b981" radius={[4, 4, 0, 0]} name="Atividades" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-semibold text-foreground mb-3">Índice de Cobertura Educacional por Bairro (ICEB)</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Fórmula: (Escolas × 2) + (Instituições × 1.5) + (Atividades × 1)
            </p>

            <div className="space-y-2">
              {neighborhoods
                .slice()
                .sort((a, b) => b.coverageIndex - a.coverageIndex)
                .map((neighborhood, index) => (
                  <div
                    key={neighborhood.name}
                    className="flex items-center justify-between p-3 bg-accent/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-foreground">{neighborhood.name}</span>
                    </div>
                    <span className="text-lg font-semibold text-primary">
                      {neighborhood.coverageIndex}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
