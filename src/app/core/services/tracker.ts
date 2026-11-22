import { getApp, getApps, initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getFirestore, increment, setDoc, Timestamp, updateDoc } from 'firebase/firestore/lite';
import { environment } from '../../../environments/environment';
import type { AnalyticsEventRecord, VisitorRecord } from './firebase.service';

/**
 * Gravações do site público com o Firestore Lite (REST): sem Auth, Storage, Messaging
 * nem conexão em tempo real — bem menos JavaScript travando o celular do visitante.
 * O painel admin continua com o FirebaseService completo.
 */
const db = getFirestore(getApps().length ? getApp() : initializeApp(environment.firebase));

export async function trackVisitor(
  visitorId: string, isFirstVisit: boolean, data: Omit<VisitorRecord, 'id' | 'visitCount' | 'firstSeen' | 'lastSeen'>,
): Promise<void> {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  const ref = doc(db, 'visitors', visitorId);
  const fresh = () => setDoc(ref, { ...clean, visitCount: 1, firstSeen: Timestamp.now(), lastSeen: Timestamp.now() });
  if (isFirstVisit) return fresh();
  // documento removido no admin: recria
  await updateDoc(ref, { ...clean, visitCount: increment(1), lastSeen: Timestamp.now() }).catch(fresh);
}

export async function trackAnalyticsEvent(data: Omit<AnalyticsEventRecord, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'analytics_events'), { ...data, createdAt: Timestamp.now() });
}

export async function setVisitorPresenceByIp(ip: string, online: boolean): Promise<void> {
  const id = ip.replace(/[.:]/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'unknown';
  await updateDoc(doc(db, 'chat_conversations', id), { visitorOnline: online }).catch(() => undefined);
}
