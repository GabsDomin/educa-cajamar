import { Institution } from '../types';
import { getMarkerColor } from '../data/mockData';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  institutions: Institution[];
  onMarkerClick?: (institution: Institution) => void;
  selectedInstitution?: Institution | null;
}

export function MapView({ institutions, onMarkerClick, selectedInstitution }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 11,
      maxZoom: 18
    }).setView([-23.3558, -46.8762], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    const points: [number, number][] = [];
    institutions.forEach((institution) => {
      const color = getMarkerColor(institution.type);
      const isSelected = selectedInstitution?.id === institution.id;

      const marker = L.circleMarker([institution.lat, institution.lng], {
        radius: isSelected ? 10 : 7,
        weight: 2,
        color: '#ffffff',
        fillColor: color,
        fillOpacity: 0.95
      });

      marker.bindTooltip(
        `<div style="font-size:12px; line-height:1.4;">
          <strong>${institution.name}</strong><br/>
          Tipo: ${institution.type}<br/>
          Classificação: ${institution.rating}/5<br/>
          Telefone: ${institution.phone}<br/>
          Bairro: ${institution.neighborhood}<br/>
          Status: ${institution.status}
        </div>`,
        {
          sticky: true,
          direction: 'top',
          offset: [0, -10],
          opacity: 1
        }
      );

      marker.on('click', () => onMarkerClick?.(institution));
      marker.addTo(markerLayer);
      points.push([institution.lat, institution.lng]);
    });

    if (points.length > 0) {
      map.fitBounds(points, { padding: [80, 80], maxZoom: 15 });
    } else {
      map.setView([-23.3558, -46.8762], 13);
    }
  }, [institutions, selectedInstitution, onMarkerClick]);

  return (
    <div className="relative w-full h-full bg-[#0f1419] rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-[500] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-sm text-foreground">
        Mapa de Cajamar/SP
      </div>

      <div ref={mapRef} className="absolute inset-0" />

      <div className="absolute bottom-4 right-4 z-[500] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-foreground">Escola</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
            <span className="text-foreground">Cultural</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <span className="text-foreground">Esporte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-foreground">Curso/Oficina</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span className="text-foreground">Projeto Social</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
            <span className="text-foreground">Biblioteca</span>
          </div>
        </div>
      </div>
    </div>
  );
}
