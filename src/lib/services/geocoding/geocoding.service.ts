export type GeoCoordinates = { lat: number; lng: number };
export type NormalizedAddress = { street?: string; number?: string; neighborhood?: string; city?: string; state?: string; country?: string };

export interface GeocodingService {
  geocode(query: string): Promise<{ coordinates?: GeoCoordinates; address?: NormalizedAddress; confidence: number }>;
  reverseGeocode(coords: GeoCoordinates): Promise<{ address?: NormalizedAddress; confidence: number }>;
  normalizeAddress(raw: string): NormalizedAddress;
}

class NominatimGeocodingService implements GeocodingService {
  async geocode(query: string): Promise<{ coordinates?: GeoCoordinates; address?: NormalizedAddress; confidence: number }> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { "accept-language": "es" } });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      return { coordinates: { lat: Number(first.lat), lng: Number(first.lon) }, address: this.normalizeAddress(first.display_name || query), confidence: 0.6 };
    }
    return { confidence: 0 };
  }
  async reverseGeocode(coords: GeoCoordinates): Promise<{ address?: NormalizedAddress; confidence: number }> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { "accept-language": "es" } });
    const data = await res.json();
    const display = data?.display_name || "";
    return { address: this.normalizeAddress(display), confidence: 0.6 };
  }
  normalizeAddress(raw: string): NormalizedAddress {
    const cleaned = raw
      .replace(/\bAv\.?\b/gi, "Avenida")
      .replace(/\bC\.?\b/gi, "Calle")
      .replace(/\bNo\.?\b/gi, "Número")
      .replace(/\s+/g, " ")
      .trim();
    const parts = cleaned.split(",").map((p) => p.trim());
    return { street: parts[0], city: parts.at(-3), state: parts.at(-2), country: parts.at(-1) };
  }
}

let currentService: GeocodingService = new NominatimGeocodingService();

export function setGeocodingService(service: GeocodingService) {
  currentService = service;
}

export function getGeocodingService(): GeocodingService {
  return currentService;
}

