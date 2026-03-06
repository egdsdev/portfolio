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

      const geo = await fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .catch(() => ({}));

      await this.firebase.trackVisitor(visitorId, {
        ip: geo['ip'] ?? 'unknown',
        city: geo['city'],
        country: geo['country_name'],
        region: geo['region'],
        lat: geo['latitude'],
        lng: geo['longitude'],
        timezone: geo['timezone'],
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
