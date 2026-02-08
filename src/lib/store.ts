/**
 * Simple in-memory store keyed by dataKey.
 * Components read/write via dataKey for automatic wiring (e.g. FormBuilder -> DataTable).
 */
type Store = Record<string, unknown[]>;

let store: Store = {};

const listeners = new Set<(key: string) => void>();

export function getData(dataKey: string): unknown[] {
  return store[dataKey] ?? [];
}

export function setData(dataKey: string, data: unknown[]): void {
  store[dataKey] = data;
  listeners.forEach((fn) => fn(dataKey));
}

export function appendRow(dataKey: string, row: Record<string, unknown>): void {
  const current = getData(dataKey) as Record<string, unknown>[];
  setData(dataKey, [...current, row]);
}

export function updateRow(
  dataKey: string,
  index: number,
  updates: Partial<Record<string, unknown>>
): void {
  const current = getData(dataKey) as Record<string, unknown>[];
  if (index < 0 || index >= current.length) return;
  const next = [...current];
  next[index] = { ...next[index], ...updates };
  setData(dataKey, next);
}

export function subscribe(fn: (key: string) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function clearStore(): void {
  store = {};
  listeners.forEach((fn) => fn(""));
}

// React hook to access the full store
import { useState, useEffect } from "react";

export function useStore() {
  const [storeState, setStoreState] = useState<Store>({ ...store });

  useEffect(() => {
    const update = () => setStoreState({ ...store });
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  return { store: storeState };
}

