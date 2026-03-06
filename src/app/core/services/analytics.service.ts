import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private firebase = inject(FirebaseService);

  async trackVisit(): Promise<void> {
    try {
      let visitorId = localStorage.getItem('portfolio-vid');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('portfolio-vid', visitorId);
      }

      let geo: Record<string, unknown> = {};
      try {
        // ipinfo.io: gratuito, CORS habilitado, sem API key
        const data = await fetch('https://ipinfo.io/json').then(r => r.json());
        const [lat, lng] = (data['loc'] ?? ',').split(',').map(Number);
        geo = {
          ip: data['ip'],
          city: data['city'],
          country: data['country'],
          region: data['region'],
          lat: isNaN(lat) ? undefined : lat,
          lng: isNaN(lng) ? undefined : lng,
          timezone: data['timezone'],
        };
      } catch {
        // geo opcional — continua sem ele
      }

      await this.firebase.trackVisitor(visitorId, {
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
      });
    } catch {
      // silent — tracking nunca deve quebrar o app
    }
  }

  updateMatchScore(_score: number, _areas: string[]): void {}
}
