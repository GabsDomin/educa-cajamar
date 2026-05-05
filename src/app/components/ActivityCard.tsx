import { Clock, Users, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onViewInstitution?: (id: string) => void;
  onViewMap?: () => void;
}

export function ActivityCard({ activity, onViewInstitution, onViewMap }: ActivityCardProps) {
  const categoryColors: Record<string, string> = {
    'Luta': 'bg-red-500/10 text-red-500',
    'Dança': 'bg-pink-500/10 text-pink-500',
    'Música': 'bg-purple-500/10 text-purple-500',
    'Instrumentos': 'bg-purple-500/10 text-purple-500',
    'Reforço Escolar': 'bg-blue-500/10 text-blue-500',
    'Robótica': 'bg-cyan-500/10 text-cyan-500',
    'Teatro': 'bg-yellow-500/10 text-yellow-500',
    'Esporte': 'bg-green-500/10 text-green-500',
    'Oficina Cultural': 'bg-orange-500/10 text-orange-500',
    'Idiomas': 'bg-indigo-500/10 text-indigo-500',
    'Informática': 'bg-blue-500/10 text-blue-500',
    'Projeto Social': 'bg-emerald-500/10 text-emerald-500'
  };

  const colorClass = categoryColors[activity.category] || 'bg-primary/10 text-primary';

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">{activity.name}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-xs ${colorClass}`}>
            {activity.category}
          </span>
        </div>

        {activity.isFree && (
          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
            Gratuita
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{activity.institutionName} • {activity.neighborhood}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{activity.weekDays.join(', ')}, {activity.startTime} às {activity.endTime}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{activity.targetAudience} • {activity.ageRange}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          {activity.status === 'Aberta' ? (
            <CheckCircle2 className="w-4 h-4 text-accent" />
          ) : (
            <XCircle className="w-4 h-4 text-destructive" />
          )}
          <span className="text-sm text-muted-foreground">
            {activity.availableSlots} vagas disponíveis
          </span>
        </div>

        <button
          onClick={() => onViewInstitution?.(activity.institutionId)}
          className="px-3 py-1 text-sm text-primary hover:underline"
        >
          Ver instituição
        </button>
      </div>
    </div>
  );
}
