import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const firebaseConfigError = missingConfig.length > 0
  ? `Firebase configuration is missing: ${missingConfig.join(', ')}`
  : null

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let firestore: Firestore | undefined

function getFirebaseApp() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available in the browser.')
  }
  if (firebaseConfigError) {
    throw new Error(firebaseConfigError)
  }
  firebaseApp ??= getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return firebaseApp
}

export function getFirebaseAuth() {
  firebaseAuth ??= getAuth(getFirebaseApp())
  return firebaseAuth
}

export function getFirebaseFirestore() {
  firestore ??= getFirestore(getFirebaseApp())
  return firestore
}

