import { MapPin, Phone, Star, Calendar } from 'lucide-react';
import { Institution } from '../types';
import { getMarkerColor } from '../data/mockData';

interface InstitutionCardProps {
  institution: Institution;
  onViewDetails?: (id: string) => void;
  onViewMap?: (id: string) => void;
}

export function InstitutionCard({ institution, onViewDetails, onViewMap }: InstitutionCardProps) {
  const markerColor = getMarkerColor(institution.type);

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: markerColor }}
            />
            <span className="text-xs text-muted-foreground">{institution.type}</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">{institution.name}</h3>
        </div>

        <div className="flex items-center gap-1 bg-highlight/10 text-highlight px-2 py-1 rounded">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-sm font-medium">{institution.rating}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{institution.neighborhood} • {institution.street}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{institution.phone}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails?.(institution.id)}
          className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm transition-colors"
        >
          Ver detalhes
        </button>
        <button
          onClick={() => onViewMap?.(institution.id)}
          className="px-3 py-2 border border-border hover:border-primary text-foreground rounded text-sm transition-colors"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
