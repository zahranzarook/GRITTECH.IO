// Firebase setup for the GRIT member area.
// This web config is public by design (it identifies the project; it is not a secret).
// Access to data is protected by Firebase Auth and the rules in firestore.rules.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';

export const firebaseConfig = {
  apiKey: 'REPLACE_WITH_API_KEY',
  authDomain: 'grittech-io.firebaseapp.com',
  projectId: 'grittech-io',
  storageBucket: 'grittech-io.firebasestorage.app',
  messagingSenderId: 'REPLACE_WITH_SENDER_ID',
  appId: 'REPLACE_WITH_APP_ID',
};

export const isConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith('REPLACE_'));

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
