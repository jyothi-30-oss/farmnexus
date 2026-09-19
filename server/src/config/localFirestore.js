import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'firestore_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class LocalFirestore {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load local firestore db, initializing empty:', err.message);
    }
    return {};
  }

  _save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist local firestore db:', err.message);
    }
  }

  collection(collectionName) {
    if (!this.data[collectionName]) {
      this.data[collectionName] = {};
    }
    return new LocalCollectionReference(this, collectionName);
  }

  async runTransaction(updateFunction) {
    const transaction = {
      get: async (docRef) => docRef.get(),
      set: (docRef, data, options) => docRef.set(data, options),
      update: (docRef, data) => docRef.update(data),
      delete: (docRef) => docRef.delete(),
    };
    return await updateFunction(transaction);
  }
}

class LocalCollectionReference {
  constructor(db, collectionName, filters = [], orders = [], limitCount = null) {
    this.db = db;
    this.collectionName = collectionName;
    this.filters = filters;
    this.orders = orders;
    this.limitCount = limitCount;
  }

  doc(id) {
    const docId = id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return new LocalDocumentReference(this.db, this.collectionName, docId);
  }

  async add(data) {
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const docRef = new LocalDocumentReference(this.db, this.collectionName, docId);
    await docRef.set(data);
    return docRef;
  }

  where(field, op, value) {
    return new LocalCollectionReference(
      this.db,
      this.collectionName,
      [...this.filters, { field, op, value }],
      [...this.orders],
      this.limitCount
    );
  }

  orderBy(field, direction = 'asc') {
    return new LocalCollectionReference(
      this.db,
      this.collectionName,
      [...this.filters],
      [...this.orders, { field, direction }],
      this.limitCount
    );
  }

  limit(count) {
    return new LocalCollectionReference(
      this.db,
      this.collectionName,
      [...this.filters],
      [...this.orders],
      count
    );
  }

  async get() {
    const collectionData = this.db.data[this.collectionName] || {};
    let docs = Object.entries(collectionData).map(([id, data]) => {
      return new LocalDocumentSnapshot(id, data);
    });

    // Apply filters
    for (const filter of this.filters) {
      docs = docs.filter((docSnap) => {
        const val = docSnap.data()[filter.field];
        switch (filter.op) {
          case '==':
            return val === filter.value;
          case '!=':
            return val !== filter.value;
          case '>':
            return val > filter.value;
          case '>=':
            return val >= filter.value;
          case '<':
            return val < filter.value;
          case '<=':
            return val <= filter.value;
          case 'array-contains':
            return Array.isArray(val) && val.includes(filter.value);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(val);
          default:
            return true;
        }
      });
    }

    // Apply orders
    if (this.orders.length > 0) {
      docs.sort((a, b) => {
        for (const order of this.orders) {
          const valA = a.data()[order.field];
          const valB = b.data()[order.field];
          if (valA < valB) return order.direction === 'desc' ? 1 : -1;
          if (valA > valB) return order.direction === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null && this.limitCount >= 0) {
      docs = docs.slice(0, this.limitCount);
    }

    return new LocalQuerySnapshot(docs);
  }
}

class LocalDocumentReference {
  constructor(db, collectionName, id) {
    this.db = db;
    this.collectionName = collectionName;
    this.id = id;
  }

  async get() {
    const collectionData = this.db.data[this.collectionName] || {};
    const docData = collectionData[this.id];
    return new LocalDocumentSnapshot(this.id, docData ? { ...docData } : null);
  }

  async set(data, options = {}) {
    if (!this.db.data[this.collectionName]) {
      this.db.data[this.collectionName] = {};
    }
    if (options.merge && this.db.data[this.collectionName][this.id]) {
      this.db.data[this.collectionName][this.id] = {
        ...this.db.data[this.collectionName][this.id],
        ...data,
      };
    } else {
      this.db.data[this.collectionName][this.id] = { ...data };
    }
    this.db._save();
    return { writeTime: new Date() };
  }

  async update(data) {
    if (!this.db.data[this.collectionName] || !this.db.data[this.collectionName][this.id]) {
      throw new Error(`Document ${this.id} does not exist in collection ${this.collectionName}`);
    }
    this.db.data[this.collectionName][this.id] = {
      ...this.db.data[this.collectionName][this.id],
      ...data,
    };
    this.db._save();
    return { writeTime: new Date() };
  }

  async delete() {
    if (this.db.data[this.collectionName] && this.db.data[this.collectionName][this.id]) {
      delete this.db.data[this.collectionName][this.id];
      this.db._save();
    }
    return { writeTime: new Date() };
  }
}

class LocalDocumentSnapshot {
  constructor(id, data) {
    this.id = id;
    this._data = data;
    this.exists = data !== null && data !== undefined;
  }

  data() {
    return this._data ? { ...this._data } : undefined;
  }
}

class LocalQuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.empty = docs.length === 0;
    this.size = docs.length;
  }

  forEach(callback) {
    this.docs.forEach(callback);
  }
}

export const createLocalFirestore = () => new LocalFirestore();
