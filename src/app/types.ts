export type InstitutionType =
  | 'Escola'
  | 'Cultural'
  | 'Esporte'
  | 'Curso'
  | 'Oficina'
  | 'Projeto Social'
  | 'Biblioteca'
  | 'Atividade Independente';

export type ActivityCategory =
  | 'Luta'
  | 'Dança'
  | 'Música'
  | 'Instrumentos'
  | 'Reforço Escolar'
  | 'Robótica'
  | 'Teatro'
  | 'Esporte'
  | 'Oficina Cultural'
  | 'Idiomas'
  | 'Informática'
  | 'Projeto Social';

export type SchoolNetwork = 'Municipal' | 'Estadual' | 'Privada' | 'Técnica';

export type ActivityStatus = 'Aberta' | 'Encerrada' | 'Em Breve';

export type InstitutionStatus = 'Ativa' | 'Inativa' | 'Em Manutenção';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  rating: number;
  address: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  imageUrl?: string;
  description: string;
  openingHours: string;
  targetAudience: string;
  isFree: 'Sim' | 'Não' | 'Parcial';
  accessibility: 'Sim' | 'Parcial' | 'Não Informado';
  responsible: string;
  status: InstitutionStatus;
  lastUpdate: string;
  lat: number;
  lng: number;
  schoolNetwork?: SchoolNetwork;
  schoolLevels?: string[];
  schoolShifts?: string[];
  infrastructure?: string[];
  nota_portugues_saresp?: number | null;
  nota_matematica_saresp?: number | null;
  ano_base?: number | null;
  taxa_aprovacao?: number | null;
  taxa_evolucao?: number | null;
}

export interface Activity {
  id: string;
  name: string;
  institutionId: string;
  institutionName: string;
  category: ActivityCategory;
  description: string;
  weekDays: string[];
  startTime: string;
  endTime: string;
  targetAudience: string;
  ageRange: string;
  isFree: boolean;
  availableSlots: number;
  totalSlots: number;
  status: ActivityStatus;
  enrollmentInfo: string;
  instructor?: string;
  neighborhood: string;
}

export interface Marker {
  id: string;
  lat: number;
  lng: number;
  type: InstitutionType;
  institution: Institution;
}

export interface KPI {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export interface Neighborhood {
  name: string;
  schoolCount: number;
  institutionCount: number;
  activityCount: number;
  averageRating: number;
  coverageIndex: number;
}
