'use client'

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

const PENNY_POWERPLAYS_FALLBACK = {
  apiKey: 'AIzaSyBgjtQU9Kdw1v1ZgY0iHL9WfV8ao8RCMfg',
  authDomain: 'penny-powerplays.firebaseapp.com',
  databaseURL: 'https://penny-powerplays-default-rtdb.firebaseio.com',
  projectId: 'penny-powerplays',
  storageBucket: 'penny-powerplays.appspot.com',
  messagingSenderId: '91939738441',
  appId: '1:91939738441:web:8a1216a1430a1457690098',
  measurementId: 'G-ZWS3GQ0JCE',
}

function resolveFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (apiKey && authDomain && projectId) {
    return {
      apiKey,
      authDomain,
      databaseURL:
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
        `https://${projectId}-default-rtdb.firebaseio.com`,
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || undefined,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || undefined,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
    }
  }

  return PENNY_POWERPLAYS_FALLBACK
}

let cachedApp: FirebaseApp | null = null
let cachedAuth: Auth | null = null
let cachedDb: Database | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null
  if (cachedApp) return cachedApp
  const config = resolveFirebaseConfig()
  cachedApp = getApps().length > 0 ? getApp() : initializeApp(config)
  return cachedApp
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp()
  if (!app) return null
  if (!cachedAuth) cachedAuth = getAuth(app)
  return cachedAuth
}

export function getFirebaseDatabase(): Database | null {
  const app = getFirebaseApp()
  if (!app) return null
  if (!cachedDb) cachedDb = getDatabase(app)
  return cachedDb
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Google Sign-In is only available in the browser.')
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signOutGoogle(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) return
  await signOut(auth)
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth()
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}
