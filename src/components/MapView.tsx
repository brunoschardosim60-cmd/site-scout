import { useEffect, useRef } from "react";
import type { Company } from "@/lib/types";
import { opportunityOf } from "@/lib/scoring";

const COLORS: Record<string, string> = {
  alta: "#ef4444",
  boa: "#f97316",
  moderada: "#eab308",
  baixa: "#22c55e",
};

export default function MapView({
  companies,
  selectedId,
  onSelect,
  center,
  radiusKm,
}: {
  companies: Company[];
  selectedId?: string | undefined;
  onSelect: (id: string) => void;
  center?: { lat: number; lng: number } | undefined;
  radiusKm?: number | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(ref.current, { zoomControl: true }).setView([-29.95, -51.15], 11);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      renderMarkers();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMarkers() {
    const L = LRef.current;
    const layer = layerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    companies.forEach((c) => {
      const color = COLORS[opportunityOf(c)] ?? "#64748b";
      const selected = c.id === selectedId;
      const marker = L.circleMarker([c.lat, c.lng], {
        radius: selected ? 11 : 7,
        color: selected ? "#0ea5e9" : color,
        weight: selected ? 3 : 2,
        fillColor: color,
        fillOpacity: 0.85,
      });
      marker.bindTooltip(
        `<strong>${c.name}</strong><br/>${c.segment} — ${c.city}<br/>${c.site.hasSite ? "Com site" : "Sem site"}`,
        { direction: "top" },
      );
      marker.on("click", () => onSelect(c.id));
      marker.addTo(layer);
    });
  }

  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, selectedId]);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (center) {
      map.setView([center.lat, center.lng], radiusKm && radiusKm < 15 ? 12 : 10);
      if (radiusKm) {
        circleRef.current = L.circle([center.lat, center.lng], {
          radius: radiusKm * 1000,
          color: "#0ea5e9",
          weight: 1,
          fillOpacity: 0.06,
        }).addTo(map);
      }
    }
  }, [center, radiusKm]);

  return <div ref={ref} className="h-full w-full rounded-xl" />;
}
