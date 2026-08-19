import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Firebase Web configuration is public client configuration, not a server secret.
// The environment variables take precedence; fallbacks keep a deployment from
// crashing when Vercel variables have not been added yet.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAGEh_U0a7RYftyyVXDUyXOYijlgosRpTk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'qldademo-ec420.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'qldademo-ec420',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'qldademo-ec420.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '735511632627',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:735511632627:web:ba2f982f56981a19daf586',
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
