import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore, Firestore, collection, addDoc, getDocs,
  query, orderBy, Timestamp, doc, setDoc, updateDoc, increment,
} from 'firebase/firestore';
import {
  getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

export interface AiMatchRecord {
  id?: string;
  jobDescription: string;
  aiResponse: string;
  matchPercentage: number;
  createdAt: Date;
}

export interface VisitorRecord {
  id?: string;
  ip: string;
  city?: string;
  country?: string;
  region?: string;
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
        jobDescription: d['jobDescription'],
        aiResponse: d['aiResponse'],
        matchPercentage: d['matchPercentage'],
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

  async trackVisitor(visitorId: string, isFirstVisit: boolean, data: Omit<VisitorRecord, 'id' | 'visitCount' | 'firstSeen' | 'lastSeen'>): Promise<void> {
    const ref = doc(this.db, 'visitors', visitorId);
    if (isFirstVisit) {
      await setDoc(ref, {
        ...data,
        visitCount: 1,
        firstSeen: Timestamp.now(),
        lastSeen: Timestamp.now(),
      });
    } else {
      try {
        await updateDoc(ref, {
          ...data,
          visitCount: increment(1),
          lastSeen: Timestamp.now(),
        });
      } catch {
        // Documento removido — recria
        await setDoc(ref, {
          ...data,
          visitCount: 1,
          firstSeen: Timestamp.now(),
          lastSeen: Timestamp.now(),
        });
      }
    }
  }
}
