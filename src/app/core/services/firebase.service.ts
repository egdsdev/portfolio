import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore, Firestore, collection, addDoc, getDocs,
  query, orderBy, Timestamp,
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
    return snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        ip: d['ip'] ?? '',
        city: d['city'],
        country: d['country'],
        region: d['region'],
        language: d['language'],
        timezone: d['timezone'],
        lat: d['lat'],
        lng: d['lng'],
        referrer: d['referrer'],
        userAgent: d['userAgent'],
        screenWidth: d['screenWidth'],
        screenHeight: d['screenHeight'],
        preciseLocation: d['preciseLocation'],
        visitCount: d['visitCount'] ?? 1,
        firstSeen: d['firstSeen']?.toDate() ?? new Date(),
        lastSeen: d['lastSeen']?.toDate() ?? new Date(),
      };
    });
  }
}
