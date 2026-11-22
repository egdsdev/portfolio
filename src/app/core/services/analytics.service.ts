import { Injectable } from '@angular/core';
import type { AnalyticsMetadata } from './firebase.service';
import { lazyFirebase } from './firebase.loader';

interface GeoPayload {
  ip?: string;
  city?: string;
  country?: string;
  region?: string;
  networkOrg?: string;
  networkAsn?: string;
  networkType?: string;
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
  /** SDK do Firebase carregado sob demanda (fora do JS inicial) */
  private firebase = lazyFirebase();

  /** dono do site + servidor dos testes automatizados (177.104.188.141): não contam como visita */
  private readonly IGNORED_IPS = ['45.179.22.183', '138.255.215.188', '177.104.188.141'];
  private readonly TRACKED_SECTIONS = [
    'intro',
    'detalhes',
    'experiencia',
    'cases',
    'habilidades',
    'escolaridade',
    'contato',
  ];

  private contextPromise?: Promise<AnalyticsContext | null>;
  private sectionObserver?: IntersectionObserver;
  private trackedSections = new Set<string>();
  private visitTracked = false;

  async trackVisit(): Promise<void> {
    try {
      if (this.visitTracked) return;
      this.visitTracked = true;

      const ctx = await this.ensureContext();
      if (!ctx) return;

      await (await this.firebase()).trackVisitor(ctx.visitorId, ctx.isFirstVisit, {
        ip: ctx.geo.ip ?? 'unknown',
        city: ctx.geo.city,
        country: ctx.geo.country,
        region: ctx.geo.region,
        networkOrg: ctx.geo.networkOrg,
        networkAsn: ctx.geo.networkAsn,
        networkType: ctx.geo.networkType,
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
          void this.firebase().then(f => f.updateVisitorCoords(ctx.visitorId, coords.latitude, coords.longitude));
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

  async trackContactClick(channel: 'email' | 'whatsapp'): Promise<void> {
    await this.trackCtaClick(`contact_${channel}`, 'contato', 'direct_contact', { channel });
  }

  async trackResumeDownload(): Promise<void> {
    await this.trackCtaClick('resume_download', 'detalhes', 'resume');
  }

  /** Recrutador abriu "mais entregas" de uma empresa — leitura profunda. */
  async trackExperienceExpand(company: string): Promise<void> {
    await this.recordEvent({
      eventType: 'experience_expand',
      eventName: 'experience_expand',
      section: 'experiencia',
      target: company,
    });
  }

  async getVisitorIp(): Promise<string> {
    try {
      const ctx = await this.ensureContext();
      return ctx?.geo.ip ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async trackSitePresence(): Promise<void> {
    try {
      const ip = await this.getVisitorIp();
      if (ip === 'unknown') return;
      const firebase = await this.firebase();
      await firebase.setVisitorPresenceByIp(ip, true);
      const offline = () => { void firebase.setVisitorPresenceByIp(ip, false); };
      window.addEventListener('beforeunload', offline);
      window.addEventListener('pagehide', offline);
    } catch { /* silencioso */ }
  }






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
    eventType: 'page_visit' | 'section_view' | 'cta_click' | 'experience_expand';
    eventName: string;
    section?: string;
    target?: string;
    value?: number;
    metadata?: AnalyticsMetadata;
  }): Promise<void> {
    try {
      const ctx = await this.ensureContext();
      if (!ctx) return;

      await (await this.firebase()).trackAnalyticsEvent({
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
          if (!this.shouldTrackSectionEntry(entry)) continue;
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
      }, { threshold: [0, 0.12, 0.35, 0.6] });

      sectionEls.forEach(section => this.sectionObserver?.observe(section));
    }, attempt === 0 ? 250 : 450);
  }

  private shouldTrackSectionEntry(entry: IntersectionObserverEntry): boolean {
    if (!entry.isIntersecting) return false;

    const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
    const visibleHeight = Math.max(entry.intersectionRect.height, 0);

    if (entry.intersectionRatio >= 0.12) return true;
    if (visibleHeight >= Math.min(240, viewportHeight * 0.28)) return true;

    const viewportMidpoint = viewportHeight / 2;
    return entry.boundingClientRect.top <= viewportMidpoint
      && entry.boundingClientRect.bottom >= viewportMidpoint;
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
      const data = await fetch('https://ipinfo.io/json').then(r => r.json()) as Record<string, unknown>;
      const loc = typeof data['loc'] === 'string' ? data['loc'] : ',';
      const [lat, lng] = loc.split(',').map(Number);
      const networkInfo = this.parseNetworkInfo(data);
      return {
        ip: data['ip'] as string | undefined,
        city: data['city'] as string | undefined,
        country: data['country'] as string | undefined,
        region: data['region'] as string | undefined,
        networkOrg: networkInfo.networkOrg,
        networkAsn: networkInfo.networkAsn,
        networkType: networkInfo.networkType,
        lat: isNaN(lat) ? undefined : lat,
        lng: isNaN(lng) ? undefined : lng,
        timezone: data['timezone'] as string | undefined,
      };
    } catch {
      return {};
    }
  }

  private parseNetworkInfo(data: Record<string, unknown>): Pick<GeoPayload, 'networkOrg' | 'networkAsn' | 'networkType'> {
    const company = typeof data['company'] === 'object' && data['company'] != null
      ? data['company'] as Record<string, unknown>
      : undefined;
    const asData = typeof data['as'] === 'object' && data['as'] != null
      ? data['as'] as Record<string, unknown>
      : undefined;

    let networkOrg = typeof company?.['name'] === 'string' ? company['name'].trim() : undefined;
    let networkType = typeof company?.['type'] === 'string' ? company['type'].trim().toLowerCase() : undefined;
    let networkAsn = typeof asData?.['asn'] === 'string' ? asData['asn'].trim().toUpperCase() : undefined;

    if (!networkOrg && typeof asData?.['name'] === 'string') {
      networkOrg = asData['name'].trim();
    }

    const org = typeof data['org'] === 'string' ? data['org'].trim() : undefined;
    if (org) {
      const match = org.match(/^(AS\d+)\s+(.+)$/i);
      if (match) {
        networkAsn ??= match[1].toUpperCase();
        networkOrg ??= match[2].trim();
      } else {
        networkOrg ??= org;
      }
    }

    if (!networkAsn && typeof data['asn'] === 'string') {
      networkAsn = data['asn'].trim().toUpperCase();
    }

    if (!networkOrg && typeof data['as_name'] === 'string') {
      networkOrg = data['as_name'].trim();
    }

    return {
      networkOrg,
      networkAsn,
      networkType,
    };
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
