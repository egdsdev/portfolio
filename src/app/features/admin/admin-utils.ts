import { AnalyticsEventRecord, VisitorRecord } from '../../core/services/firebase.service';

export type NetworkKind = 'business' | 'isp' | 'hosting' | 'education' | 'unknown';

/** Janela em que um visitante conta como "online agora". */
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function isOnline(v: VisitorRecord, now = Date.now()): boolean {
  return now - new Date(v.lastSeen).getTime() < ONLINE_WINDOW_MS;
}

export function isMobile(ua?: string): boolean {
  return /mobile|android|iphone|ipad/i.test(ua ?? '');
}

export function isTablet(ua?: string): boolean {
  return /ipad|tablet/i.test(ua ?? '');
}

export function deviceLabel(v: VisitorRecord): string {
  if (isTablet(v.userAgent)) return 'Tablet';
  return isMobile(v.userAgent) ? 'Mobile' : 'Desktop';
}

export function browserLabel(ua?: string): string {
  if (!ua) return '';
  const browser = /edg\//i.test(ua) ? 'Edge'
    : /opr\//i.test(ua) ? 'Opera'
    : /chrome|crios/i.test(ua) ? 'Chrome'
    : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /safari/i.test(ua) ? 'Safari' : '';
  const os = /windows/i.test(ua) ? 'Windows'
    : /android/i.test(ua) ? 'Android'
    : /iphone|ipad|ios/i.test(ua) ? 'iOS'
    : /mac os/i.test(ua) ? 'macOS'
    : /linux/i.test(ua) ? 'Linux' : '';
  return [browser, os].filter(Boolean).join(' · ');
}

export function locationLabel(v: VisitorRecord): string {
  return [v.city, v.country].filter(Boolean).join(', ') || 'Local desconhecido';
}

export function hasNetworkInfo(v?: VisitorRecord): boolean {
  return !!v && !!(v.networkOrg?.trim() || v.networkAsn?.trim() || v.networkType?.trim());
}

export function networkSummary(v?: VisitorRecord): string {
  if (!v) return '';
  return [v.networkOrg?.trim(), v.networkAsn?.trim()].filter(Boolean).join(' · ');
}

export function networkKind(v?: VisitorRecord): NetworkKind {
  const explicitType = v?.networkType?.trim().toLowerCase();
  if (explicitType) {
    if (/(business|enterprise|company|corp)/.test(explicitType)) return 'business';
    if (/(isp|carrier|mobile|telecom)/.test(explicitType)) return 'isp';
    if (/(hosting|cloud|proxy|datacenter)/.test(explicitType)) return 'hosting';
    if (/(education|edu|university|school|college)/.test(explicitType)) return 'education';
  }

  const owner = v?.networkOrg?.trim().toLowerCase() ?? '';
  if (!owner) return 'unknown';

  if (/(univers|college|school|institut|\bedu\b)/.test(owner)) return 'education';
  if (/(amazon|aws|google cloud|microsoft|azure|cloudflare|digitalocean|linode|vultr|oracle cloud|ovh|contabo|hostinger|server|hosting|datacenter|cloud)/.test(owner)) return 'hosting';
  if (/(claro|vivo|telef[oô]nica|telefonica|tim|oi|algar|embratel|comcast|verizon|at&t|telecom|internet|fibra|broadband|wireless|mobile|carrier|\bisp\b|communications?)/.test(owner)) return 'isp';
  if (/(\bltda\b|\bs\.a\.?\b|\bsa\b|\bllc\b|\binc\b|\bcorp\b|corporation|company|empresa|grupo|group|solutions?|solu[cç]oes|tecnologia|tech|systems?|software|holding|industr(?:y|ia))/.test(owner)) return 'business';
  return 'unknown';
}

const NETWORK_KIND_META: Record<NetworkKind, { label: string; bg: string; fg: string }> = {
  business: { label: 'Empresa provável', bg: 'rgba(34, 197, 94, 0.14)', fg: '#4ade80' },
  isp: { label: 'ISP / operadora', bg: 'rgba(56, 189, 248, 0.14)', fg: '#38bdf8' },
  hosting: { label: 'Hosting / cloud', bg: 'rgba(168, 85, 247, 0.14)', fg: '#c084fc' },
  education: { label: 'Instituição de ensino', bg: 'rgba(245, 158, 11, 0.14)', fg: '#fbbf24' },
  unknown: { label: 'Rede atribuída', bg: 'rgba(148, 163, 184, 0.14)', fg: '#94a3b8' },
};

export function networkKindMeta(v?: VisitorRecord) {
  return NETWORK_KIND_META[networkKind(v)];
}

export function networkKindTitle(v?: VisitorRecord): string {
  const summary = networkSummary(v);
  const suffix = summary ? ` Rede detectada: ${summary}.` : '';
  return `Estimativa baseada na organização dona do bloco de IP, não na empresa real do visitante.${suffix}`;
}

export function sourceFromReferrer(referrer?: string): string {
  if (!referrer) return 'Direto';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('github')) return 'GitHub';
    if (host.includes('google')) return 'Google';
    if (host.includes('gupy')) return 'Gupy';
    if (host.includes('openai') || host.includes('chatgpt')) return 'ChatGPT';
    return 'Outro';
  } catch {
    return 'Direto';
  }
}

export function ctaLabel(target: string): string {
  const labels: Record<string, string> = {
    hero_contact: 'Hero · Contato',
    lang_pt: 'Idioma · Português',
    lang_en: 'Idioma · Inglês',
    intro_reveal: 'Intro · Revelar',
    intro_resume: 'Intro · Currículo',
    case_portfolio_code: 'Cases · Código do portfólio',
    sticky_contact: 'Barra fixa · Falar comigo',
    sticky_resume: 'Barra fixa · Currículo',
    menu_resume: 'Menu · Currículo',
    resume_download: 'Hero · Baixar currículo',
    project_brulias: 'Projeto · Brulias',
    contact_email: 'Contato · Email',
    contact_whatsapp: 'Contato · WhatsApp',
    dev_match_contact_success: 'Dev Match · CTA forte',
    dev_match_contact_surprise: 'Dev Match · CTA alternativo',
    dev_match_contact: 'Dev Match · Contato (legado)',
    ai_match_contact: 'IA Match · Entrar em contato',
    'nav_dev-match': 'Header · Match',
    nav_projetos: 'Header · Projetos',
    nav_contato: 'Header · Contato',
  };
  return labels[target] ?? target;
}

export function sectionLabel(section: string): string {
  const labels: Record<string, string> = {
    intro: 'Intro',
    detalhes: 'Hero',
    cases: 'Cases',
    escolaridade: 'Formação',
    experiencia: 'Experiência',
    habilidades: 'Skills',
    projetos: 'Projetos',
    'dev-match': 'Dev Match',
    certificacoes: 'Certificações',
    contato: 'Contato',
  };
  return labels[section] ?? section;
}

/** Texto curto de um evento para a linha do tempo do visitante. */
export function eventLabel(e: AnalyticsEventRecord): { text: string; strong: boolean } {
  switch (e.eventType) {
    case 'page_visit':
      return { text: `Entrou no site · ${e.source}`, strong: false };
    case 'section_view':
      return { text: `Viu ${sectionLabel(e.section ?? '')}`, strong: false };
    case 'experience_expand':
      return { text: `Abriu "mais entregas"${e.target ? ' · ' + e.target : ''}`, strong: true };
    case 'cta_click':
      return { text: `Clicou em ${ctaLabel(e.target ?? e.eventName)}`, strong: true };
    default:
      return { text: e.eventName, strong: false };
  }
}

export function relativeTime(value: Date | string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(value).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d} d`;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export interface ScoreInfo {
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  label: string;
  reasons: string[];
}

export function scoreTier(score: number): ScoreInfo['tier'] {
  return score >= 60 ? 'hot' : score >= 30 ? 'warm' : 'cold';
}

export const TIER_COLOR: Record<ScoreInfo['tier'], string> = {
  hot: '#4ade80',
  warm: '#fbbf24',
  cold: '#a1a1aa',
};
