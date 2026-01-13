import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/api/firebase';

// Editable marketing texts (doc id = contentKey)
const COLLECTION = 'site_content';

export async function fetchAllSiteContent() {
  const snap = await getDocs(collection(db, COLLECTION));
  const map = {};
  snap.forEach((d) => {
    const data = d.data() || {};
    map[d.id] = typeof data.value === 'string' ? data.value : '';
  });
  return map;
}

export async function fetchSiteContentValue(contentKey) {
  const ref = doc(db, COLLECTION, contentKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() || {};
  return typeof data.value === 'string' ? data.value : null;
}

export async function saveSiteContentValue(contentKey, value) {
  const ref = doc(db, COLLECTION, contentKey);
  await setDoc(
    ref,
    {
      key: contentKey,
      value: String(value ?? ''),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
}
