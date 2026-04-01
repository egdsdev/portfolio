import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private firebase = inject(FirebaseService);

  private readonly IGNORED_IPS = ['45.179.22.183'];

  async trackVisit(): Promise<void> {
    try {
      const geo = await this.fetchIpGeo();
      if (this.IGNORED_IPS.includes(geo['ip'] as string)) return;

      const isFirstVisit = !localStorage.getItem('portfolio-vid');
      let visitorId = localStorage.getItem('portfolio-vid');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('portfolio-vid', visitorId);
      }

      // Salva imediatamente com geolocalização por IP (sem esperar permissão do navegador)
      await this.firebase.trackVisitor(visitorId, isFirstVisit, {
        ip: (geo['ip'] as string) ?? 'unknown',
        city: geo['city'] as string | undefined,
        country: geo['country'] as string | undefined,
        region: geo['region'] as string | undefined,
        lat: geo['lat'] as number | undefined,
        lng: geo['lng'] as number | undefined,
        timezone: geo['timezone'] as string | undefined,
        language: navigator.language,
        userAgent: navigator.userAgent,
        screenWidth: screen.width,
        screenHeight: screen.height,
        referrer: document.referrer || undefined,
        preciseLocation: false,
      });

      // Solicita localização precisa em background — atualiza coords se concedido
      this.requestPreciseLocation().then(coords => {
        if (coords) {
          this.firebase.updateVisitorCoords(visitorId!, coords.latitude, coords.longitude);
        }
      });
    } catch (err) {
      console.error('[Analytics] trackVisit error:', err);
    }
  }

  private async fetchIpGeo(): Promise<Record<string, unknown>> {
    try {
      const data = await fetch('https://ipinfo.io/json').then(r => r.json());
      const [lat, lng] = (data['loc'] ?? ',').split(',').map(Number);
      return {
        ip: data['ip'],
        city: data['city'],
        country: data['country'],
        region: data['region'],
        lat: isNaN(lat) ? undefined : lat,
        lng: isNaN(lng) ? undefined : lng,
        timezone: data['timezone'],
      };
    } catch {
      return {};
    }
  }

  private requestPreciseLocation(): Promise<GeolocationCoordinates | null> {
    return new Promise(resolve => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 },
      );
    });
  }

  updateMatchScore(_score: number, _areas: string[]): void {}
}
