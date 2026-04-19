import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore, Firestore, collection, addDoc, getDocs, getDoc,
  query, orderBy, Timestamp, doc, setDoc, updateDoc, increment, deleteDoc, where, onSnapshot,
} from 'firebase/firestore';
import {
  getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

export interface AiMatchRecord {
  id?: string;
  visitorId?: string;
  jobDescription: string;
  aiResponse: string;
  matchPercentage: number;
  createdAt: Date;
}

export interface DevMatchRecord {
  id?: string;
  visitorId?: string;
  areas: string[];
  requirements: string[];
  matchPercentage: number;
  createdAt: Date;
}

export interface VisitorRecord {
  id?: string;
  ip: string;
  city?: string;
  country?: string;
  region?: string;
  networkOrg?: string;
  networkAsn?: string;
  networkType?: string;
  language?: string;
  timezone?: string;
  lat?: number;
  lng?: number;
  referrer?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  preciseLocation?: boolean;
  visitCount: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ChatConversation {
  id?: string;
  username: string;
  company?: string;
  ip?: string;
  startedAt: Date;
  lastMessageAt: Date;
  unreadByOwner: number;
}

export interface ChatMessage {
  id?: string;
  sender: 'visitor' | 'owner';
  text: string;
  sentAt: Date;
}

export type AnalyticsMetadata = Record<string, string | number | boolean | null>;

export interface AnalyticsEventRecord {
  id?: string;
  visitorId?: string;
  sessionId: string;
  ip?: string;
  source: string;
  sourceDetail?: string;
  eventType: 'page_visit' | 'section_view' | 'cta_click' | 'feature_start' | 'feature_complete';
  eventName: string;
  section?: string;
  target?: string;
  value?: number;
  metadata?: AnalyticsMetadata;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app: FirebaseApp;
  private db: Firestore;
  private auth: Auth;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  // ---- Auth ----
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  isLoggedIn(): Promise<boolean> {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => resolve(!!user));
    });
  }

  // ---- AI Matches ----
  async saveAiMatch(data: Omit<AiMatchRecord, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'ai_matches'), {
      ...data,
      createdAt: Timestamp.now(),
    });
  }

  async getAiMatches(): Promise<AiMatchRecord[]> {
    const q = query(collection(this.db, 'ai_matches'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        visitorId: d['visitorId'],
        jobDescription: d['jobDescription'],
        aiResponse: d['aiResponse'],
        matchPercentage: d['matchPercentage'],
        createdAt: d['createdAt']?.toDate() ?? new Date(),
      };
    });
  }

  async saveDevMatch(data: Omit<DevMatchRecord, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'dev_matches'), {
      ...data,
      createdAt: Timestamp.now(),
    });
  }

  async getDevMatches(): Promise<DevMatchRecord[]> {
    const q = query(collection(this.db, 'dev_matches'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        visitorId: d['visitorId'],
        areas: d['areas'] ?? [],
        requirements: d['requirements'] ?? [],
        matchPercentage: d['matchPercentage'] ?? 0,
        createdAt: d['createdAt']?.toDate() ?? new Date(),
      };
    });
  }

  async getVisitors(): Promise<VisitorRecord[]> {
    const q = query(collection(this.db, 'visitors'), orderBy('lastSeen', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ip: data['ip'] ?? '',
        city: data['city'],
        country: data['country'],
        region: data['region'],
        networkOrg: data['networkOrg'],
        networkAsn: data['networkAsn'],
        networkType: data['networkType'],
        language: data['language'],
        timezone: data['timezone'],
        lat: data['lat'],
        lng: data['lng'],
        referrer: data['referrer'],
        userAgent: data['userAgent'],
        screenWidth: data['screenWidth'],
        screenHeight: data['screenHeight'],
        preciseLocation: data['preciseLocation'],
        visitCount: data['visitCount'] ?? 1,
        firstSeen: data['firstSeen']?.toDate() ?? new Date(),
        lastSeen: data['lastSeen']?.toDate() ?? new Date(),
      };
    });
  }

  async touchVisitor(visitorId: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'visitors', visitorId), { lastSeen: Timestamp.now() });
    } catch { /* visitante sem doc ainda — ignora */ }
  }

  async updateVisitorCoords(visitorId: string, lat: number, lng: number): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'visitors', visitorId), { lat, lng, preciseLocation: true });
    } catch { /* ignora */ }
  }

  async deleteVisitor(visitorId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'visitors', visitorId));
    // Apaga matches associados
    const aiSnap = await getDocs(query(collection(this.db, 'ai_matches'), where('visitorId', '==', visitorId)));
    await Promise.all(aiSnap.docs.map(d => deleteDoc(d.ref)));
    const devSnap = await getDocs(query(collection(this.db, 'dev_matches'), where('visitorId', '==', visitorId)));
    await Promise.all(devSnap.docs.map(d => deleteDoc(d.ref)));
    const analyticsSnap = await getDocs(query(collection(this.db, 'analytics_events'), where('visitorId', '==', visitorId)));
    await Promise.all(analyticsSnap.docs.map(d => deleteDoc(d.ref)));
  }

  async deleteVisitorsByIds(visitorIds: string[]): Promise<void> {
    await Promise.all(visitorIds.map(visitorId => this.deleteVisitor(visitorId)));
  }

  async trackBruliasClick(ip: string): Promise<void> {
    await addDoc(collection(this.db, 'brulias_clicks'), {
      ip,
      createdAt: Timestamp.now(),
    });
  }

  async getBruliasClicks(): Promise<{ ip: string; createdAt: Date }[]> {
    const snap = await getDocs(collection(this.db, 'brulias_clicks'));
    return snap.docs.map(d => ({
      ip: d.data()['ip'] as string,
      createdAt: (d.data()['createdAt'] as Timestamp).toDate(),
    }));
  }

  async trackAnalyticsEvent(data: Omit<AnalyticsEventRecord, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'analytics_events'), {
      ...data,
      createdAt: Timestamp.now(),
    });
  }

  async getAnalyticsEvents(): Promise<AnalyticsEventRecord[]> {
    const q = query(collection(this.db, 'analytics_events'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        visitorId: data['visitorId'],
        sessionId: data['sessionId'] ?? '',
        ip: data['ip'],
        source: data['source'] ?? 'Direto',
        sourceDetail: data['sourceDetail'],
        eventType: data['eventType'] ?? 'page_visit',
        eventName: data['eventName'] ?? 'unknown',
        section: data['section'],
        target: data['target'],
        value: typeof data['value'] === 'number' ? data['value'] : undefined,
        metadata: (data['metadata'] ?? {}) as AnalyticsMetadata,
        createdAt: data['createdAt']?.toDate() ?? new Date(),
      } as AnalyticsEventRecord;
    });
  }

  // ---- Chat ----
  private ipToDocId(ip: string): string {
    // Converte IP em ID válido para Firestore (sem pontos, dois-pontos ou barras)
    return ip.replace(/[.:]/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'unknown';
  }

  async createChatConversation(data: { username: string; company?: string; ip: string }): Promise<string> {
    const docId = this.ipToDocId(data.ip);
    const ref = doc(this.db, 'chat_conversations', docId);
    const existing = await getDoc(ref);

    if (existing.exists()) {
      // Mesma pessoa voltando: atualiza nome/empresa mas mantém o histórico
      await updateDoc(ref, {
        username: data.username,
        ...(data.company ? { company: data.company } : {}),
      });
    } else {
      // Novo visitante: cria a conversa com o IP como chave
      await setDoc(ref, {
        username: data.username,
        ...(data.company ? { company: data.company } : {}),
        ip: data.ip,
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        unreadByOwner: 0,
      });
    }

    return docId;
  }

  async sendChatMessage(conversationId: string, text: string, sender: 'visitor' | 'owner'): Promise<void> {
    await addDoc(collection(this.db, 'chat_conversations', conversationId, 'messages'), {
      sender,
      text,
      sentAt: Timestamp.now(),
    });
    await updateDoc(doc(this.db, 'chat_conversations', conversationId), {
      lastMessageAt: Timestamp.now(),
      ...(sender === 'visitor' ? { unreadByOwner: increment(1) } : {}),
    });
  }

  listenToChatMessages(conversationId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(this.db, 'chat_conversations', conversationId, 'messages'),
      orderBy('sentAt', 'asc'),
    );
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({
        id: d.id,
        sender: d.data()['sender'] as 'visitor' | 'owner',
        text: d.data()['text'] as string,
        sentAt: d.data()['sentAt']?.toDate() ?? new Date(),
      })));
    });
  }

  listenToConversations(callback: (convs: ChatConversation[]) => void): () => void {
    const q = query(
      collection(this.db, 'chat_conversations'),
      orderBy('lastMessageAt', 'desc'),
    );
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({
        id: d.id,
        username: d.data()['username'] ?? 'Anônimo',
        company: d.data()['company'],
        ip: d.data()['ip'],
        startedAt: d.data()['startedAt']?.toDate() ?? new Date(),
        lastMessageAt: d.data()['lastMessageAt']?.toDate() ?? new Date(),
        unreadByOwner: d.data()['unreadByOwner'] ?? 0,
      })));
    });
  }

  async markConversationRead(conversationId: string): Promise<void> {
    await updateDoc(doc(this.db, 'chat_conversations', conversationId), { unreadByOwner: 0 });
  }

  async trackVisitor(visitorId: string, isFirstVisit: boolean, data: Omit<VisitorRecord, 'id' | 'visitCount' | 'firstSeen' | 'lastSeen'>): Promise<void> {
    // Firestore rejeita campos undefined; remove-os antes de gravar
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const ref = doc(this.db, 'visitors', visitorId);
    if (isFirstVisit) {
      await setDoc(ref, {
        ...clean,
        visitCount: 1,
        firstSeen: Timestamp.now(),
        lastSeen: Timestamp.now(),
      });
    } else {
      try {
        await updateDoc(ref, {
          ...clean,
          visitCount: increment(1),
          lastSeen: Timestamp.now(),
        });
      } catch {
        // Documento removido — recria
        await setDoc(ref, {
          ...clean,
          visitCount: 1,
          firstSeen: Timestamp.now(),
          lastSeen: Timestamp.now(),
        });
      }
    }
  }
}
