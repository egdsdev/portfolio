import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore, Firestore, collection, addDoc, getDocs,
  query, orderBy, Timestamp, doc, setDoc, updateDoc, increment, deleteDoc, where, onSnapshot, deleteField, runTransaction,
} from 'firebase/firestore';
import {
  getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  getMessaging, getToken, Messaging, isSupported,
} from 'firebase/messaging';
import {
  getStorage, FirebaseStorage, ref as storageRef, uploadBytes, getDownloadURL,
} from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
  visitorOnline?: boolean;
}

export interface ChatMessage {
  id?: string;
  sender: 'visitor' | 'owner';
  text: string;
  sentAt: Date;
  fileUrl?: string;
  fileName?: string;
  deletedAt?: Date;
  editedAt?: Date;
}

export const CHAT_MESSAGE_EDIT_WINDOW_MS = 60 * 60 * 1000;

export function isChatMessageWithinEditWindow(sentAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - sentAt.getTime() <= CHAT_MESSAGE_EDIT_WINDOW_MS;
}

export type AnalyticsMetadata = Record<string, string | number | boolean | null>;

export interface AnalyticsEventRecord {
  id?: string;
  visitorId?: string;
  sessionId: string;
  ip?: string;
  source: string;
  sourceDetail?: string;
  eventType: 'page_visit' | 'section_view' | 'cta_click' | 'experience_expand';
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
  private messaging: Messaging | null = null;
  private storage: FirebaseStorage;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);
    isSupported().then(supported => {
      if (supported) this.messaging = getMessaging(this.app);
    });
  }

  /**
   * Chama a Cloud Function que fala com o Gemini. A chave da API fica no
   * servidor (Secret Manager) — nunca no bundle do client.
   */
  async analyzeJourneys(prompt: string): Promise<string> {
    const callable = httpsCallable<{ prompt: string }, { text: string }>(
      getFunctions(this.app), 'analyzeJourneys'
    );
    const result = await callable({ prompt });
    return result.data.text;
  }

  // ── FCM Push Notifications ────────────────────────────────────────────
  async requestPushPermission(): Promise<string | null> {
    try {
      const supported = await isSupported();
      if (!supported) return null;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;
      if (!this.messaging) this.messaging = getMessaging(this.app);
      const token = await getToken(this.messaging, { vapidKey: environment.firebase.vapidKey });
      await setDoc(doc(this.db, 'admin_config', 'notifications'), { fcmToken: token, updatedAt: Timestamp.now() });
      return token;
    } catch (err) {
      console.error('[FCM] requestPushPermission error:', err);
      return null;
    }
  }

  async getSavedFCMToken(): Promise<string | null> {
    try {
      const snap = await import('firebase/firestore').then(({ getDoc }) =>
        getDoc(doc(this.db, 'admin_config', 'notifications'))
      );
      return snap.exists() ? (snap.data()['fcmToken'] as string) ?? null : null;
    } catch {
      return null;
    }
  }

  /** Enfileira um email de teste. Retorna o docId para monitorar o status. */
  async queueTestEmail(subject: string, body: string): Promise<string> {
    const ref = await addDoc(collection(this.db, 'test_notifications'), {
      type: 'email',
      subject,
      body,
      sentAt: Timestamp.now(),
      status: 'pending',
    });
    return ref.id;
  }

  /** Escuta atualizações de status de um test_notification. Retorna unsubscribe. */
  listenTestNotificationStatus(
    docId: string,
    callback: (status: string, error?: string) => void,
  ): () => void {
    return onSnapshot(doc(this.db, 'test_notifications', docId), snap => {
      const d = snap.data();
      if (d?.['status'] && d['status'] !== 'pending') {
        callback(d['status'] as string, d['error'] as string | undefined);
      }
    });
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

  listenAuthState(callback: (loggedIn: boolean) => void): () => void {
    return onAuthStateChanged(this.auth, user => callback(!!user));
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
    return snap.docs.map(d => this.toVisitor(d.id, d.data()));
  }

  /** Visitantes em tempo real (admin). */
  listenVisitors(callback: (visitors: VisitorRecord[]) => void, onError?: (err: unknown) => void): () => void {
    const q = query(collection(this.db, 'visitors'), orderBy('lastSeen', 'desc'));
    return onSnapshot(q, snap => callback(snap.docs.map(d => this.toVisitor(d.id, d.data()))), onError);
  }

  private toVisitor(id: string, data: Record<string, any>): VisitorRecord {
    return {
      id,
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
    return snap.docs.map(d => this.toAnalyticsEvent(d.id, d.data()));
  }

  /** Eventos de analytics em tempo real (admin). */
  listenAnalyticsEvents(callback: (events: AnalyticsEventRecord[]) => void, onError?: (err: unknown) => void): () => void {
    const q = query(collection(this.db, 'analytics_events'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => callback(snap.docs.map(d => this.toAnalyticsEvent(d.id, d.data()))), onError);
  }

  private toAnalyticsEvent(id: string, data: Record<string, any>): AnalyticsEventRecord {
    return {
      id,
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
  }

  // ---- Chat ----
  private ipToDocId(ip: string): string {
    // Converte IP em ID válido para Firestore (sem pontos, dois-pontos ou barras)
    return ip.replace(/[.:]/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'unknown';
  }

  async createChatConversation(data: { username: string; company?: string; ip: string }): Promise<string> {
    const docId = this.ipToDocId(data.ip);
    const ref = doc(this.db, 'chat_conversations', docId);

    try {
      // Tenta atualizar documento existente (não requer permissão de leitura prévia)
      await updateDoc(ref, {
        username: data.username,
        ...(data.company ? { company: data.company } : {}),
      });
    } catch {
      // Documento não existe ainda — cria com todos os campos iniciais
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

  async updateChatConversationProfile(
    conversationId: string,
    data: { username: string; company?: string },
  ): Promise<void> {
    await updateDoc(doc(this.db, 'chat_conversations', conversationId), {
      username: data.username,
      ...(data.company ? { company: data.company } : { company: deleteField() }),
    });
  }

  async sendChatMessage(
    conversationId: string,
    text: string,
    sender: 'visitor' | 'owner',
    file?: { url: string; name: string },
  ): Promise<void> {
    await addDoc(collection(this.db, 'chat_conversations', conversationId, 'messages'), {
      sender,
      text,
      ...(file ? { fileUrl: file.url, fileName: file.name } : {}),
      sentAt: Timestamp.now(),
    });
    await updateDoc(doc(this.db, 'chat_conversations', conversationId), {
      lastMessageAt: Timestamp.now(),
      ...(sender === 'visitor' ? { unreadByOwner: increment(1) } : {}),
    });
  }

  async uploadChatFile(conversationId: string, file: File): Promise<{ url: string; name: string }> {
    const path = `chat_files/${conversationId}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(this.storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { url, name: file.name };
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
        fileUrl: d.data()['fileUrl'] as string | undefined,
        fileName: d.data()['fileName'] as string | undefined,
        deletedAt: d.data()['deletedAt']?.toDate() as Date | undefined,
        editedAt: d.data()['editedAt']?.toDate() as Date | undefined,
      })));
    });
  }

  async updateChatMessage(conversationId: string, messageId: string, text: string): Promise<void> {
    const msgRef = doc(this.db, 'chat_conversations', conversationId, 'messages', messageId);
    const editsCol = collection(this.db, 'chat_conversations', conversationId, 'messages', messageId, 'edits');

    await runTransaction(this.db, async transaction => {
      const snapshot = await transaction.get(msgRef);
      if (!snapshot.exists()) throw new Error('MESSAGE_NOT_FOUND');

      const currentData = snapshot.data();
      const sentAt = currentData['sentAt']?.toDate() as Date | undefined;
      const oldText = currentData['text'] as string | undefined;

      if (!sentAt || !isChatMessageWithinEditWindow(sentAt)) {
        throw new Error('EDIT_WINDOW_EXPIRED');
      }

      if (typeof oldText !== 'string' || oldText === text) return;

      const now = Timestamp.now();
      const editRef = doc(editsCol);

      transaction.set(editRef, { text: oldText, archivedAt: now });
      transaction.update(msgRef, { text, editedAt: now });
    });
  }

  async softDeleteChatMessage(conversationId: string, messageId: string): Promise<void> {
    await updateDoc(
      doc(this.db, 'chat_conversations', conversationId, 'messages', messageId),
      { deletedAt: Timestamp.now() },
    );
  }

  async deleteConversation(conversationId: string): Promise<void> {
    // Deleta todas as mensagens primeiro, depois a conversa
    const msgsSnap = await import('firebase/firestore').then(({ getDocs }) =>
      getDocs(collection(this.db, 'chat_conversations', conversationId, 'messages'))
    );
    const batch = (await import('firebase/firestore')).writeBatch(this.db);
    for (const msgDoc of msgsSnap.docs) {
      batch.delete(msgDoc.ref);
    }
    batch.delete(doc(this.db, 'chat_conversations', conversationId));
    await batch.commit();
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
        visitorOnline: d.data()['visitorOnline'] ?? false,
      })));
    });
  }

  async setVisitorOnline(conversationId: string, online: boolean): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'chat_conversations', conversationId), { visitorOnline: online });
    } catch { /* ignora se doc não existe ainda */ }
  }

  // Atualiza presença do visitante usando IP diretamente (sem precisar do conversationId)
  async setVisitorPresenceByIp(ip: string, online: boolean): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'chat_conversations', this.ipToDocId(ip)), { visitorOnline: online });
    } catch { /* sem conversa ainda — silencioso */ }
  }

  async markConversationRead(conversationId: string): Promise<void> {
    await updateDoc(doc(this.db, 'chat_conversations', conversationId), { unreadByOwner: 0 });
  }

  // ── Owner presence ──────────────────────────────────────────────────────
  async setOwnerOnline(online: boolean): Promise<void> {
    await setDoc(doc(this.db, 'presence', 'owner'), {
      online,
      updatedAt: Timestamp.now(),
    });
  }

  listenToOwnerPresence(callback: (online: boolean) => void): () => void {
    return onSnapshot(doc(this.db, 'presence', 'owner'), snap => {
      callback(snap.exists() ? (snap.data()['online'] as boolean ?? false) : false);
    });
  }

  /** Ouve visitantes ativos (campo `online: true` em visitors com lastSeen < 5min) */
  listenActiveVisitors(callback: (count: number) => void): () => void {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const q = query(
      collection(this.db, 'visitors'),
      where('lastSeen', '>=', Timestamp.fromDate(since)),
    );
    return onSnapshot(q, snap => {
      callback(snap.size);
    });
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
