import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as qLimit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

function parseOrder(orderStr) {
  // base44 style: '-created_date' means desc
  if (!orderStr) return { field: 'created_date', dir: 'desc' };
  const dir = orderStr.startsWith('-') ? 'desc' : 'asc';
  const field = orderStr.replace(/^[+-]/, '');
  return { field, dir };
}

function withId(snap) {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function makeEntity(colName) {
  const colRef = collection(db, colName);

  return {
    async list(orderStr = '-created_date', limitN) {
      const { field, dir } = parseOrder(orderStr);
      const clauses = [orderBy(field, dir)];
      if (limitN) clauses.push(qLimit(limitN));
      const q = query(colRef, ...clauses);
      const snap = await getDocs(q);
      return withId(snap);
    },

    async filter(filterObj = {}, orderStr = '-created_date', limitN) {
      // Special case: filter by id (document id)
      if (filterObj && typeof filterObj === 'object' && 'id' in filterObj && Object.keys(filterObj).length === 1) {
        const dref = doc(db, colName, filterObj.id);
        const dsnap = await getDoc(dref);
        if (!dsnap.exists()) return [];
        return [{ id: dsnap.id, ...dsnap.data() }];
      }

      const { field, dir } = parseOrder(orderStr);
      const clauses = [];

      if (filterObj && typeof filterObj === 'object') {
        for (const [k, v] of Object.entries(filterObj)) {
          if (k === 'id') continue;
          if (v === undefined) continue;
          clauses.push(where(k, '==', v));
        }
      }

      clauses.push(orderBy(field, dir));
      if (limitN) clauses.push(qLimit(limitN));

      const q = query(colRef, ...clauses);
      const snap = await getDocs(q);
      let res = withId(snap);

      // If 'id' was included alongside other filters, filter client-side
      if (filterObj?.id) {
        res = res.filter((r) => r.id === filterObj.id);
      }
      return res;
    },

    async create(data) {
      const payload = {
        ...data,
        created_date: data?.created_date || new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      const docRef = await addDoc(colRef, payload);
      return { id: docRef.id, ...payload };
    },

    async update(id, data) {
      const dref = doc(db, colName, id);
      const payload = { ...data, updated_date: new Date().toISOString() };
      await updateDoc(dref, payload);
      const dsnap = await getDoc(dref);
      return dsnap.exists() ? { id: dsnap.id, ...dsnap.data() } : { id, ...payload };
    },

    async delete(id) {
      const dref = doc(db, colName, id);
      await deleteDoc(dref);
      return { success: true };
    },
  };
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadFile({ file }) {
  // Try Storage first; if not configured, fall back to inline dataURL.
  if (storage) {
    try {
      const pathSafeName = `${Date.now()}_${(file?.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storageRef = ref(storage, `uploads/${pathSafeName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { file_url: url };
    } catch (e) {
      console.warn('[Upload] Storage upload failed, falling back to dataURL:', e);
    }
  }

  const url = await fileToDataUrl(file);
  return { file_url: url };
}

export const base44 = {
  entities: {
    Product: makeEntity('products'),
    Order: makeEntity('orders'),
    PageView: makeEntity('page_views'),
    ShippingMethod: makeEntity('shipping_methods'), 
    Feedback: makeEntity('feedback'),
    LegalDoc: makeEntity('legal_docs'),
    Coupon: makeEntity('coupons'),
  },
  integrations: {
    Core: {
      UploadFile: uploadFile,
    },
  },
};
