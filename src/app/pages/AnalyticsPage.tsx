import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { api } from '../services/api';
import {
  Activity as ActivityIcon,
  AlertCircle,
  Award,
  BookOpen,
  Building2,
  ClipboardCheck,
  Filter,
  GraduationCap,
  MapPin,
  Search,
  School,
  Star,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, Institution, Neighborhood } from '../types';
import { calculateScoreEducaCajamar } from '../utils/scoreEducaCajamar';

const chartTooltipStyle = {
  backgroundColor: '#1a1f2e',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  color: '#f0f4f8'
};

const formatPercent = (value: number) => `${value.toFixed(0)}%`;

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

  const filteredInstitutions = useMemo(() => {
    const byNeighborhood = selectedNeighborhood === 'Todos'
      ? institutions
      : institutions.filter((i) => i.neighborhood === selectedNeighborhood);

    const query = searchQuery.trim().toLowerCase();
    if (!query) return byNeighborhood;

    return byNeighborhood.filter((i) =>
      [i.name, i.neighborhood, i.type].some((value) => value.toLowerCase().includes(query))
    );
  }, [institutions, searchQuery, selectedNeighborhood]);

  const filteredActivities = useMemo(() => {
    const byNeighborhood = selectedNeighborhood === 'Todos'
      ? activities
      : activities.filter((a) => a.neighborhood === selectedNeighborhood);

    const query = searchQuery.trim().toLowerCase();
    if (!query) return byNeighborhood;

    return byNeighborhood.filter((a) =>
      [a.name, a.neighborhood, a.category, a.institutionName].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [activities, searchQuery, selectedNeighborhood]);

  const totalSchools = filteredInstitutions.filter((i) => i.type === 'Escola').length;
  const totalInstitutions = filteredInstitutions.length;
  const activeActivities = filteredActivities.filter((a) => a.status === 'Aberta');
  const totalActiveActivities = activeActivities.length;
  const availableSlots = activeActivities.reduce((sum, activity) => sum + activity.availableSlots, 0);
  const freeActivities = filteredActivities.filter((a) => a.isFree).length;
  const freePercentage = filteredActivities.length > 0
    ? (freeActivities / filteredActivities.length) * 100
    : 0;
  const averageRating = filteredInstitutions.length > 0
    ? filteredInstitutions.reduce((sum, i) => sum + i.rating, 0) / filteredInstitutions.length
    : 0;

  const schoolsWithScore = filteredInstitutions
    .filter((institution) => institution.type === 'Escola')
    .map((institution) => ({
      institution,
      score: calculateScoreEducaCajamar(institution)
    }))
    .filter((item) => item.score);

  const averageScore = schoolsWithScore.length > 0
    ? schoolsWithScore.reduce((sum, item) => sum + item.score!.score_educa_cajamar, 0) / schoolsWithScore.length
    : 0;

  const bestScoreSchool = schoolsWithScore
    .slice()
    .sort((a, b) => b.score!.score_educa_cajamar - a.score!.score_educa_cajamar)[0];

  const topRatedInstitution = filteredInstitutions
    .slice()
    .sort((a, b) => b.rating - a.rating)[0];

  const neighborhoodData = neighborhoods
    .filter((neighborhood) =>
      selectedNeighborhood === 'Todos' || neighborhood.name === selectedNeighborhood
    )
    .map((n) => ({
      name: n.name,
      escolas: n.schoolCount,
      instituicoes: Math.max(n.institutionCount - n.schoolCount, 0),
      atividades: n.activityCount,
      cobertura: n.coverageIndex
    }));

  const neighborhoodRanking = neighborhoodData
    .slice()
    .sort((a, b) => b.cobertura - a.cobertura);

  const topCoverageNeighborhood = neighborhoodRanking[0];
  const lowerCoverageNeighborhoods = neighborhoodRanking.slice().reverse().slice(0, 5);

  const institutionsByType = [
    { name: 'Escola', value: filteredInstitutions.filter((i) => i.type === 'Escola').length, color: '#3b82f6' },
    { name: 'Cultural', value: filteredInstitutions.filter((i) => i.type === 'Cultural').length, color: '#8b5cf6' },
    { name: 'Esporte', value: filteredInstitutions.filter((i) => i.type === 'Esporte').length, color: '#10b981' },
    { name: 'Curso/Oficina', value: filteredInstitutions.filter((i) => i.type === 'Curso' || i.type === 'Oficina').length, color: '#f59e0b' },
    { name: 'Outros', value: filteredInstitutions.filter((i) => !['Escola', 'Cultural', 'Esporte', 'Curso', 'Oficina'].includes(i.type)).length, color: '#ec4899' }
  ].filter((item) => item.value > 0);

  const activitiesByCategory = Object.values(
    filteredActivities.reduce<Record<string, { category: string; count: number; vagas: number }>>((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = { category: activity.category, count: 0, vagas: 0 };
      }
      acc[activity.category].count += 1;
      acc[activity.category].vagas += activity.status === 'Aberta' ? activity.availableSlots : 0;
      return acc;
    }, {})
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const scoreRanking = schoolsWithScore
    .slice()
    .sort((a, b) => b.score!.score_educa_cajamar - a.score!.score_educa_cajamar)
    .slice(0, 6)
    .map((item) => ({
      name: item.institution.name,
      bairro: item.institution.neighborhood,
      score: item.score!.score_educa_cajamar,
      classificacao: item.score!.classificacao_score
    }));

  const freeActivitiesWithSlots = activeActivities
    .filter((activity) => activity.isFree && activity.availableSlots > 0)
    .slice()
    .sort((a, b) => b.availableSlots - a.availableSlots)
    .slice(0, 6);

  const schoolsMissingScore = filteredInstitutions.filter((institution) =>
    institution.type === 'Escola' && !calculateScoreEducaCajamar(institution)
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Analítico" />

      <div className="pt-16 md:pt-20 px-4 md:px-6 pb-24 md:pb-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Painel Analítico
          </h1>
          <p className="text-muted-foreground">
            Dados públicos para entender a oferta educacional, cultural e esportiva de Cajamar
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar bairro, instituição, tipo ou atividade..."
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
              <option value="Todos">Todos os bairros</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.name} value={neighborhood.name}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Escolas encontradas"
            value={totalSchools}
            Icon={School}
            colorClass="bg-primary"
            trend="stable"
            trendValue={`${totalInstitutions} instituições no filtro`}
          />

          <KPICard
            label="Atividades abertas"
            value={totalActiveActivities}
            Icon={ActivityIcon}
            colorClass="bg-accent"
            trend="up"
            trendValue={`${availableSlots} vagas disponíveis`}
          />

          <KPICard
            label="Atividades gratuitas"
            value={formatPercent(freePercentage)}
            Icon={Users}
            colorClass="bg-secondary"
            trend="stable"
            trendValue={`${freeActivities} atividades gratuitas`}
          />

          <KPICard
            label="Score médio escolar"
            value={schoolsWithScore.length > 0 ? averageScore.toFixed(0) : 'Sem dados'}
            Icon={GraduationCap}
            colorClass="bg-highlight"
            trend={schoolsWithScore.length > 0 ? 'up' : 'stable'}
            trendValue={`${schoolsWithScore.length} escola(s) com SARESP`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior cobertura educacional</p>
                <p className="text-lg font-semibold text-foreground">
                  {topCoverageNeighborhood?.name || 'Sem dados'}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Índice {topCoverageNeighborhood?.cobertura || 0} considerando escolas, instituições e atividades
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-secondary p-2 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Melhor Score Educa</p>
                <p className="text-lg font-semibold text-foreground">
                  {bestScoreSchool?.institution.name || 'Sem dados suficientes'}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {bestScoreSchool ? `${bestScoreSchool.score!.score_educa_cajamar}/1000 - ${bestScoreSchool.score!.classificacao_score}` : 'Cadastre os dados do SARESP para ativar este ranking'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-accent p-2 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instituição mais avaliada</p>
                <p className="text-lg font-semibold text-foreground">
                  {topRatedInstitution?.name || 'Sem dados'}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Média geral do filtro: {averageRating.toFixed(1)} de classificação
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Oferta por tipo de instituição</h3>
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
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Atividades por categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activitiesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="category" stroke="#94a3b8" interval={0} tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Atividades" />
                <Bar dataKey="vagas" fill="#10b981" radius={[8, 8, 0, 0]} name="Vagas abertas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Cobertura educacional por bairro</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={neighborhoodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#94a3b8" interval={0} tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar dataKey="escolas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Escolas" />
                <Bar dataKey="instituicoes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Instituições" />
                <Bar dataKey="atividades" fill="#10b981" radius={[4, 4, 0, 0]} name="Atividades" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Bairros que merecem atenção</h3>
            <div className="space-y-3">
              {lowerCoverageNeighborhoods.map((neighborhood, index) => (
                <div key={neighborhood.name} className="p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 text-highlight flex-shrink-0" />
                      <p className="font-medium text-foreground truncate">{neighborhood.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Índice {neighborhood.cobertura} • {neighborhood.escolas} escola(s) • {neighborhood.atividades} atividade(s)
                  </p>
                </div>
              ))}
              {lowerCoverageNeighborhoods.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum bairro encontrado com os filtros atuais.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Ranking Score Educa Cajamar</h3>
            </div>
            <div className="space-y-3">
              {scoreRanking.map((item, index) => (
                <div key={item.name} className="p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">#{index + 1} {item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.bairro} • {item.classificacao}</p>
                    </div>
                    <span className="text-lg font-semibold text-primary">{item.score}</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.score / 10}%` }} />
                  </div>
                </div>
              ))}
              {scoreRanking.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ainda não há escolas com dados suficientes para calcular o Score Educa Cajamar.
                </p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Atividades gratuitas com vagas</h3>
            </div>
            <div className="space-y-3">
              {freeActivitiesWithSlots.map((activity) => (
                <div key={activity.id} className="p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.institutionName} • {activity.neighborhood}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-accent whitespace-nowrap">
                      {activity.availableSlots} vagas
                    </span>
                  </div>
                </div>
              ))}
              {freeActivitiesWithSlots.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade gratuita com vagas abertas nos filtros atuais.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary p-2 rounded-lg">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dados escolares completos</p>
                <p className="text-2xl font-semibold text-foreground">{schoolsWithScore.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Escolas com notas, aprovação e evolução preenchidas
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-highlight p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escolas sem score</p>
                <p className="text-2xl font-semibold text-foreground">{schoolsMissingScore}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Indica onde ainda falta complementar dados do SARESP
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-secondary p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leitura do filtro atual</p>
                <p className="text-2xl font-semibold text-foreground">{totalInstitutions + filteredActivities.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de instituições e atividades encontradas na busca
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
