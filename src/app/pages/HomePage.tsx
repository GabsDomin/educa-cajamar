import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { MapView } from '../components/MapView';
import { AIAssistant } from '../components/AIAssistant';
import { InstitutionCard } from '../components/InstitutionCard';
import { Activity, Institution } from '../types';
import { X } from 'lucide-react';
import { api } from '../services/api';
import { calculateScoreEducaCajamar, ScoreEducaResult } from '../utils/scoreEducaCajamar';

interface HomePageProps {
  focusRequest?: {
    id: string;
    showDetails: boolean;
    requestedAt: number;
  } | null;
}

const formatNumber = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

const formatPercent = (value: number, showSign = false) =>
  `${showSign && value > 0 ? '+' : ''}${formatNumber(value)}%`;

const getScoreBarClass = (classification: ScoreEducaResult['classificacao_score']) => {
  if (classification === 'Excelente') return 'bg-emerald-700';
  if (classification === 'Boa') return 'bg-green-500';
  if (classification === 'Regular') return 'bg-yellow-500';
  return 'bg-red-500';
};

function SchoolPerformanceSection({ institution }: { institution: Institution }) {
  const score = calculateScoreEducaCajamar(institution);
  const hasBaseYear = institution.ano_base !== null && institution.ano_base !== undefined;

  return (
    <div className="pt-4 border-t border-border">
      <h4 className="font-semibold text-foreground mb-3">Desempenho Escolar</h4>

      {!score || !hasBaseYear ? (
        <p className="text-sm text-muted-foreground">
          Esta escola ainda não possui dados suficientes para cálculo do Score Educa Cajamar.
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="bg-accent/20 rounded p-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground">Score Educa Cajamar</p>
                <p className="text-xl font-semibold text-foreground">
                  {score.score_educa_cajamar} / 1000
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Classificação</p>
                <p className="font-medium text-foreground">{score.classificacao_score}</p>
              </div>
            </div>

            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getScoreBarClass(score.classificacao_score)}`}
                style={{ width: `${score.score_educa_cajamar / 10}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground">Português SARESP</p>
              <p className="text-foreground">{formatNumber(Number(institution.nota_portugues_saresp))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Matemática SARESP</p>
              <p className="text-foreground">{formatNumber(Number(institution.nota_matematica_saresp))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ano-base</p>
              <p className="text-foreground">{institution.ano_base}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Taxa de aprovação</p>
              <p className="text-foreground">{formatPercent(Number(institution.taxa_aprovacao))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Taxa de evolução</p>
              <p className="text-foreground">{formatPercent(Number(institution.taxa_evolucao), true)}</p>
            </div>
          </div>

          <div className="bg-accent/20 rounded p-3">
            <p className="font-medium text-foreground mb-2">Composição do Score</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Português: <span className="text-foreground">{score.pontos_portugues} / 300</span></p>
              <p className="text-muted-foreground">Matemática: <span className="text-foreground">{score.pontos_matematica} / 300</span></p>
              <p className="text-muted-foreground">Aprovação: <span className="text-foreground">{score.pontos_aprovacao} / 200</span></p>
              <p className="text-muted-foreground">Evolução: <span className="text-foreground">{score.pontos_evolucao} / 200</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HomePage({ focusRequest }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    Promise.all([api.getInstitutions(), api.getActivities()])
      .then(([inst, acts]) => {
        setInstitutions(inst);
        setActivities(acts);
      })
      .catch((err) => console.error('Falha ao carregar dados', err));
  }, []);

  useEffect(() => {
    if (!focusRequest || institutions.length === 0) return;

    const institution = institutions.find((item) => item.id === focusRequest.id);
    if (!institution) return;

    setSearchQuery('');
    setActiveFilter('Todas');
    setSelectedInstitution(institution);
    setShowDetail(focusRequest.showDetails);
    setShowAI(false);
  }, [focusRequest, institutions]);

  const filters = [
    'Todas',
    'Escolas',
    'Cultura',
    'Esporte',
    'Luta',
    'Dança',
    'Música',
    'Instrumentos',
    'Gratuitas',
    'Infantil',
    'Jovens'
  ];

  const filteredInstitutions = useMemo(() => institutions.filter((institution) => {
    const matchesSearch =
      searchQuery === '' ||
      institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'Todas' ||
      (activeFilter === 'Escolas' && institution.type === 'Escola') ||
      (activeFilter === 'Cultura' && institution.type === 'Cultural') ||
      (activeFilter === 'Esporte' && institution.type === 'Esporte') ||
      (activeFilter === 'Gratuitas' && institution.isFree === 'Sim');

    return matchesSearch && matchesFilter;
  }), [institutions, searchQuery, activeFilter]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <Header
        currentPage="Mapa"
        onAIClick={() => setShowAI(!showAI)}
      />

      <div className="flex-1 flex flex-col md:flex-row pt-14 md:pt-16 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col p-3 md:p-4">
          <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3">
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                Encontre escolas e atividades educacionais em Cajamar
              </h1>
              <p className="text-muted-foreground">
                Busque por bairro, rua, escola ou atividade e descubra oportunidades próximas de você
              </p>
            </div>

            <SearchBar onSearch={setSearchQuery} />

            <FilterChips
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          <div className="flex-1 min-h-[45dvh] md:min-h-0 rounded-lg overflow-hidden">
            <MapView
              institutions={filteredInstitutions}
              selectedInstitution={selectedInstitution}
              onMarkerClick={(institution) => {
                setSelectedInstitution(institution);
                setShowDetail(true);
              }}
            />
          </div>
        </div>

        <div className="w-full md:w-96 h-[42dvh] md:h-auto flex flex-col gap-4 p-3 md:p-4 pb-24 md:pb-4 border-t md:border-t-0 md:border-l border-border bg-card/30 overflow-y-auto">
          {showAI ? (
            <AIAssistant
              onClose={() => setShowAI(false)}
              institutions={institutions}
            />
          ) : showDetail && selectedInstitution ? (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Detalhes da Instituição</h3>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedInstitution.google360Url ? (
                  <iframe
                    src={selectedInstitution.google360Url}
                    title={`Vista 360 de ${selectedInstitution.name}`}
                    className="w-full h-44 rounded-lg border border-border"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : selectedInstitution.imageUrl && (
                  <img
                    src={selectedInstitution.imageUrl}
                    alt={selectedInstitution.name}
                    className="w-full h-44 object-cover rounded-lg border border-border"
                  />
                )}

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {selectedInstitution.name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{selectedInstitution.type}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-highlight">⭐ {selectedInstitution.rating}/5</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Endereço</p>
                    <p className="text-foreground">{selectedInstitution.address}</p>
                    <p className="text-foreground">{selectedInstitution.neighborhood}, {selectedInstitution.city}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="text-foreground">{selectedInstitution.phone}</p>
                  </div>

                  {selectedInstitution.email && (
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="text-foreground">{selectedInstitution.email}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground">Horário de Funcionamento</p>
                    <p className="text-foreground">{selectedInstitution.openingHours}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Descrição</p>
                    <p className="text-foreground">{selectedInstitution.description}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Público-alvo</p>
                    <p className="text-foreground">{selectedInstitution.targetAudience}</p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <p className="text-muted-foreground">Gratuito</p>
                      <p className="text-foreground">{selectedInstitution.isFree}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Acessibilidade</p>
                      <p className="text-foreground">{selectedInstitution.accessibility}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Responsável</p>
                    <p className="text-foreground">{selectedInstitution.responsible}</p>
                  </div>
                </div>

                {selectedInstitution.type === 'Escola' && (
                  <SchoolPerformanceSection institution={selectedInstitution} />
                )}

                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Atividades Disponíveis</h4>
                  <div className="space-y-2">
                    {activities
                      .filter((a) => a.institutionId === selectedInstitution.id)
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="bg-accent/20 rounded p-3"
                        >
                          <p className="font-medium text-foreground">{activity.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.weekDays.join(', ')} • {activity.startTime}
                          </p>
                          <p className="text-sm text-accent">
                            {activity.isFree ? 'Gratuita' : 'Paga'}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Resultados ({filteredInstitutions.length})
                </h3>
              </div>

              <div className="space-y-3">
                {filteredInstitutions.map((institution) => (
                  <InstitutionCard
                    key={institution.id}
                    institution={institution}
                    onViewDetails={(id) => {
                      const inst = institutions.find((i) => i.id === id);
                      if (inst) {
                        setSelectedInstitution(inst);
                        setShowDetail(true);
                      }
                    }}
                    onViewMap={(id) => {
                      const inst = institutions.find((i) => i.id === id);
                      if (inst) {
                        setSelectedInstitution(inst);
                        setShowDetail(false);
                      }
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
