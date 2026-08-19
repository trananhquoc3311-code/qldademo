import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const requiredConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

// Do not throw during Next.js static generation. Vercel does not automatically
// receive local .env.local values; the client displays this error at runtime.
// Do not throw during Next.js static generation. Vercel does not automatically
// receive local .env.local values; the client displays this error at runtime.
export const firebaseConfigError = missingConfig.length > 0
  ? `Firebase configuration is missing: ${missingConfig.join(', ')}`
  : null

const app = getApps().length > 0 ? getApp() : initializeApp(requiredConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
