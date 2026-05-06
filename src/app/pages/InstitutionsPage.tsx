import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { InstitutionCard } from '../components/InstitutionCard';
import { Institution } from '../types';
import { api } from '../services/api';

interface InstitutionsPageProps {
  onViewDetails?: (id: string) => void;
  onViewMap?: (id: string) => void;
}

export function InstitutionsPage({ onViewDetails, onViewMap }: InstitutionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos');
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    api.getInstitutions()
      .then(setInstitutions)
      .catch((err) => console.error('Falha ao carregar instituições', err));
  }, []);

  const neighborhoods = useMemo(() => {
    const unique = new Set(institutions.map((i) => i.neighborhood).filter(Boolean));
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [institutions]);

  const filters = [
    'Todas',
    'Escola',
    'Cultural',
    'Esporte',
    'Curso',
    'Oficina',
    'Projeto Social',
    'Biblioteca',
    'Gratuitas',
    'Acessível'
  ];

  const filteredInstitutions = institutions.filter((institution) => {
    const matchesSearch =
      searchQuery === '' ||
      institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'Todas' ||
      institution.type === activeFilter ||
      (activeFilter === 'Gratuitas' && institution.isFree === 'Sim') ||
      (activeFilter === 'Acessível' && institution.accessibility === 'Sim');

    const matchesNeighborhood =
      selectedNeighborhood === 'Todos' || institution.neighborhood === selectedNeighborhood;

    return matchesSearch && matchesFilter && matchesNeighborhood;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="Instituições" />

      <div className="pt-20 px-6 pb-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Instituições Educacionais
          </h1>
          <p className="text-muted-foreground">
            Escolas, centros culturais, espaços esportivos e outras instituições de Cajamar
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Busque por instituição, tipo ou bairro"
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
            {filteredInstitutions.length} instituição(ões) encontrada(s)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstitutions.map((institution) => (
            <InstitutionCard
              key={institution.id}
              institution={institution}
              onViewDetails={onViewDetails}
              onViewMap={onViewMap}
            />
          ))}
        </div>

        {filteredInstitutions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma instituição encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente buscar por outro termo ou categoria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
