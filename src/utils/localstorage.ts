interface StorageDB {
  save(key: string, value: any): void;
  get<T = any>(key: string, defaultValue?: T): T;
  remove(key: string): void;
  clear(): void;
}

const db: StorageDB = {
  save(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get<T = any>(key: string, defaultValue: T = {} as T): T {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  clear(): void {
    localStorage.clear();
  }
};

export default db;
