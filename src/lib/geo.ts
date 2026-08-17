import { ALL_CITIES } from "./mock-data";

export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  "Brasil (centro)": { lat: -15.78, lng: -47.93 },
  ...Object.fromEntries(ALL_CITIES.map((c) => [c.city, { lat: c.lat, lng: c.lng }])),
};

export const STATE_LIST = Array.from(new Set(ALL_CITIES.map((c) => c.state))).sort();

/** Cidades disponíveis agrupadas por UF. */
export const CITIES_BY_STATE: Record<string, string[]> = ALL_CITIES.reduce<Record<string, string[]>>(
  (acc, c) => {
    (acc[c.state] ??= []).push(c.city);
    acc[c.state]!.sort();
    return acc;
  },
  {},
);
