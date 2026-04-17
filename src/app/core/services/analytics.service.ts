import { Injectable, inject } from '@angular/core';
import { AnalyticsMetadata, FirebaseService } from './firebase.service';

interface GeoPayload {
  ip?: string;
  city?: string;
  country?: string;
  region?: string;
  lat?: number;
  lng?: number;
  timezone?: string;
}

interface AnalyticsContext {
  visitorId: string;
  sessionId: string;
  isFirstVisit: boolean;
  source: string;
  sourceDetail?: string;
  geo: GeoPayload;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private firebase = inject(FirebaseService);

  private readonly IGNORED_IPS = ['45.179.22.183', '138.255.215.188'];
  private readonly TRACKED_SECTIONS = [
    'detalhes',
    'escolaridade',
    'experiencia',
    'habilidades',
    'projetos',
    'dev-match',
    'certificacoes',
    'contato',
  ];

  private contextPromise?: Promise<AnalyticsContext | null>;
  private sectionObserver?: IntersectionObserver;
  private trackedSections = new Set<string>();
  private startedFeatures = new Set<string>();
  private completedFeatures = new Set<string>();
  private visitTracked = false;

  async trackVisit(): Promise<void> {
    try {
      if (this.visitTracked) return;
      this.visitTracked = true;

      const ctx = await this.ensureContext();
      if (!ctx) return;

      await this.firebase.trackVisitor(ctx.visitorId, ctx.isFirstVisit, {
        ip: ctx.geo.ip ?? 'unknown',
        city: ctx.geo.city,
        country: ctx.geo.country,
        region: ctx.geo.region,
        lat: ctx.geo.lat,
        lng: ctx.geo.lng,
        timezone: ctx.geo.timezone,
        language: navigator.language,
        userAgent: navigator.userAgent,
        screenWidth: screen.width,
        screenHeight: screen.height,
        referrer: document.referrer || undefined,
        preciseLocation: false,
      });

      // Inicia rastreamento de seções ANTES de gravar o evento de página,
      // para que seções continuem sendo rastreadas mesmo se a gravação falhar.
      this.startSectionTracking();

      await this.recordEvent({
        eventType: 'page_visit',
        eventName: 'portfolio_visit',
        section: 'detalhes',
        target: 'page',
        metadata: {
          landingPath: window.location.pathname,
          referrer: document.referrer || 'direct',
        },
      });

      // Solicita localização precisa em background — atualiza coords se concedido
      this.requestPreciseLocation().then(coords => {
        if (coords) {
          this.firebase.updateVisitorCoords(ctx.visitorId, coords.latitude, coords.longitude);
        }
      });
    } catch (err) {
      console.error('[Analytics] trackVisit error:', err);
    }
  }

  destroyPageTracking(): void {
    this.sectionObserver?.disconnect();
    this.sectionObserver = undefined;
  }

  async trackCtaClick(
    target: string,
    section: string,
    category: string,
    metadata: AnalyticsMetadata = {},
  ): Promise<void> {
    await this.recordEvent({
      eventType: 'cta_click',
      eventName: target,
      target,
      section,
      metadata: {
        category,
        ...metadata,
      },
    });
  }

  async trackContactClick(channel: 'email' | 'whatsapp' | 'linkedin'): Promise<void> {
    await this.trackCtaClick(`contact_${channel}`, 'contato', 'direct_contact', { channel });
  }

  async trackResumeDownload(): Promise<void> {
    await this.trackCtaClick('resume_download', 'detalhes', 'resume');
  }

  async trackBruliasClick(): Promise<void> {
    try {
      const ctx = await this.ensureContext();
      if (!ctx) return;

      await Promise.all([
        ctx.geo.ip ? this.firebase.trackBruliasClick(ctx.geo.ip) : Promise.resolve(),
        this.trackCtaClick('project_brulias', 'projetos', 'project', { label: 'Brulias' }),
      ]);
    } catch (err) {
      console.error('[Analytics] trackBruliasClick error:', err);
    }
  }

  async trackFeatureStart(feature: 'dev_match' | 'ai_match', metadata: AnalyticsMetadata = {}): Promise<void> {
    if (this.startedFeatures.has(feature)) return;
    this.startedFeatures.add(feature);
    await this.recordEvent({
      eventType: 'feature_start',
      eventName: feature,
      target: feature,
      section: 'dev-match',
      metadata,
    });
  }

  async trackFeatureComplete(
    feature: 'dev_match' | 'ai_match',
    value?: number,
    metadata: AnalyticsMetadata = {},
  ): Promise<void> {
    this.completedFeatures.add(feature);
    await this.recordEvent({
      eventType: 'feature_complete',
      eventName: feature,
      target: feature,
      section: 'dev-match',
      value,
      metadata,
    });
  }

  isFeatureStarted(feature: 'dev_match' | 'ai_match'): boolean {
    return this.startedFeatures.has(feature);
  }

  isFeatureCompleted(feature: 'dev_match' | 'ai_match'): boolean {
    return this.completedFeatures.has(feature);
  }

  updateMatchScore(_score: number, _areas: string[]): void {}

  private async ensureContext(): Promise<AnalyticsContext | null> {
    if (!this.contextPromise) {
      this.contextPromise = (async () => {
        const existingVisitorId = localStorage.getItem('portfolio-vid');
        const geo = await this.fetchIpGeo();
        if (geo.ip && this.IGNORED_IPS.includes(geo.ip)) return null;

        const visitorId = existingVisitorId ?? crypto.randomUUID();
        if (!existingVisitorId) {
          localStorage.setItem('portfolio-vid', visitorId);
        }

        const sourceInfo = this.resolveTrafficSource();
        return {
          visitorId,
          sessionId: crypto.randomUUID(),
          isFirstVisit: !existingVisitorId,
          source: sourceInfo.source,
          sourceDetail: sourceInfo.sourceDetail,
          geo,
        } satisfies AnalyticsContext;
      })();
    }

    return this.contextPromise;
  }

  private async recordEvent(payload: {
    eventType: 'page_visit' | 'section_view' | 'cta_click' | 'feature_start' | 'feature_complete';
    eventName: string;
    section?: string;
    target?: string;
    value?: number;
    metadata?: AnalyticsMetadata;
  }): Promise<void> {
    try {
      const ctx = await this.ensureContext();
      if (!ctx) return;

      await this.firebase.trackAnalyticsEvent({
        visitorId: ctx.visitorId,
        sessionId: ctx.sessionId,
        ip: ctx.geo.ip,
        source: ctx.source,
        sourceDetail: ctx.sourceDetail,
        ...payload,
      });
    } catch (err) {
      console.warn('[Analytics] Falha ao gravar evento', payload.eventType, '—', err);
    }
  }

  private startSectionTracking(attempt = 0): void {
    if (typeof window === 'undefined' || this.sectionObserver) return;

    window.setTimeout(() => {
      const sectionEls = this.TRACKED_SECTIONS
        .map(id => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);

      if (!sectionEls.length) {
        if (attempt < 6) {
          this.startSectionTracking(attempt + 1);
        }
        return;
      }

      this.sectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) continue;
          const sectionId = entry.target.id;
          if (!sectionId || this.trackedSections.has(sectionId)) continue;

          this.trackedSections.add(sectionId);
          void this.recordEvent({
            eventType: 'section_view',
            eventName: `section_${sectionId}`,
            section: sectionId,
            target: sectionId,
          });
        }
      }, { threshold: [0.35, 0.6] });

      sectionEls.forEach(section => this.sectionObserver?.observe(section));
    }, attempt === 0 ? 250 : 450);
  }

  private resolveTrafficSource(): { source: string; sourceDetail?: string } {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source')?.trim();
      if (utmSource) {
        return {
          source: this.normalizeSourceLabel(utmSource),
          sourceDetail: `utm:${utmSource.toLowerCase()}`,
        };
      }

      const referrer = document.referrer;
      if (!referrer) {
        return { source: 'Direto', sourceDetail: 'direct' };
      }

      const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
      if (host.includes('linkedin')) return { source: 'LinkedIn', sourceDetail: host };
      if (host.includes('github')) return { source: 'GitHub', sourceDetail: host };
      if (host.includes('google')) return { source: 'Google', sourceDetail: host };
      if (host.includes('gupy')) return { source: 'Gupy', sourceDetail: host };
      if (host.includes('openai') || host.includes('chatgpt')) return { source: 'ChatGPT', sourceDetail: host };
      return { source: 'Outro', sourceDetail: host };
    } catch {
      return { source: 'Direto', sourceDetail: 'direct' };
    }
  }

  private normalizeSourceLabel(source: string): string {
    const normalized = source.trim().toLowerCase();
    if (normalized === 'linkedin') return 'LinkedIn';
    if (normalized === 'github') return 'GitHub';
    if (normalized === 'google') return 'Google';
    if (normalized === 'gupy') return 'Gupy';
    if (normalized === 'chatgpt' || normalized === 'openai') return 'ChatGPT';
    if (normalized === 'direct' || normalized === 'direto') return 'Direto';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  private async fetchIpGeo(): Promise<GeoPayload> {
    try {
      const data = await fetch('https://ipinfo.io/json').then(r => r.json());
      const [lat, lng] = (data['loc'] ?? ',').split(',').map(Number);
      return {
        ip: data['ip'] as string | undefined,
        city: data['city'] as string | undefined,
        country: data['country'] as string | undefined,
        region: data['region'] as string | undefined,
        lat: isNaN(lat) ? undefined : lat,
        lng: isNaN(lng) ? undefined : lng,
        timezone: data['timezone'] as string | undefined,
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
}
