import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig';

export function getFirebaseApp() {
  if (!firebaseConfig?.apiKey || firebaseConfig.apiKey.startsWith('PASTE_')) {
    // We still initialize so the app can render, but operations will fail with a clear message.
    // This helps the user see the UI immediately.
    console.warn('[Firebase] Missing config. Paste your firebaseConfig into src/firebaseConfig.js');
  }

  const apps = getApps();
  return apps.length ? apps[0] : initializeApp(firebaseConfig);
}

export const db = getFirestore(getFirebaseApp());
export const auth = getAuth(getFirebaseApp());

// Storage is optional (admin image upload will fall back to dataURL if Storage is not available)
export let storage;
try {
  storage = getStorage(getFirebaseApp());
} catch (e) {
  storage = null;
}
