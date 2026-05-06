import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { ActivityCard } from '../components/ActivityCard';
import { Activity, Institution } from '../types';
import { api } from '../services/api';

interface ActivitiesPageProps {
  onViewInstitution?: (id: string) => void;
}

export function ActivitiesPage({ onViewInstitution }: ActivitiesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    Promise.all([api.getActivities(), api.getInstitutions()])
      .then(([acts, inst]) => {
        setActivities(acts);
        setInstitutions(inst);
      })
      .catch((err) => console.error('Falha ao carregar dados', err));
  }, []);

  const neighborhoods = useMemo(() => {
    const unique = new Set(institutions.map((i) => i.neighborhood).filter(Boolean));
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [institutions]);

  const filters = [
    'Todas',
    'Luta',
    'Dança',
    'Música',
    'Instrumentos',
    'Reforço Escolar',
    'Robótica',
    'Teatro',
    'Esporte',
    'Gratuitas'
  ];

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      searchQuery === '' ||
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'Todas' ||
      activity.category === activeFilter ||
      (activeFilter === 'Gratuitas' && activity.isFree);

    const matchesNeighborhood =
      selectedNeighborhood === 'Todos' || activity.neighborhood === selectedNeighborhood;

    return matchesSearch && matchesFilter && matchesNeighborhood;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Atividades" />

      <div className="pt-20 px-6 pb-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Atividades Educacionais e Culturais
          </h1>
          <p className="text-muted-foreground">
            Encontre aulas, oficinas, esportes e atividades culturais oferecidas em Cajamar
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Busque por atividade, categoria ou bairro"
          />

          <FilterChips
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="w-full md:w-80 px-4 py-3 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="Todos">Todos os bairros</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredActivities.length} atividade(s) encontrada(s)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onViewInstitution={onViewInstitution}
            />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente buscar por outro termo ou categoria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
