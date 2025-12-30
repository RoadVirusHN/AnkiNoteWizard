import { create } from 'zustand';

interface FetchAnkiRequestBody {
  action: string;
  params?: Record<string, unknown>;
}
interface AnkiResponseBody<T = unknown> {
  result: T;
  error: string | null;
}
interface AnkiConnectionState {
  isConnected: boolean;
  isPending: boolean;
  decks: string[];
  models: string[];
  checkConnection: () => Promise<void>;
  fetchAnki: <T>(request: FetchAnkiRequestBody) => Promise<AnkiResponseBody<T>>;
}

const callAnki = async <T>(request: FetchAnkiRequestBody): Promise<AnkiResponseBody<T>> => {
  const res = await fetch('http://127.0.0.1:8765', {
    method: 'POST',
    body: JSON.stringify({ ...request, version: 5 }),
  })
    .then((data) => data.json())
    .catch((err) => {
      throw err;
    });
  return res as AnkiResponseBody<T>;
};

const useAnkiConnectionStore = create<AnkiConnectionState>((set, get) => ({
  isConnected: false,
  isPending: false,
  decks: [],
  models: [],
  checkConnection: async () => {
    if (get().isPending) return;
    set({ isPending: true });
    const res = await callAnki<string[]>({ action: 'deckNames' }).catch((err) => {
      set({ isPending: false, isConnected: false, decks: [] });
      return { result: null, error: err.message };
    });
    set({ isPending: false, isConnected: !res.error, decks: res.result || [] });
    const userModels = await callAnki<string[]>({ action: 'modelNames' })
    set({ models: userModels.result || [] });
  },
  fetchAnki: async <T>(request: FetchAnkiRequestBody) => {
    if (get().isConnected === false) return Promise.reject('Anki is not connected');
    if (get().isPending) return Promise.reject('Another request is pending');
    set({ isPending: true });
    const res = await callAnki<T>(request).catch((err) => {
      set({ isPending: false, isConnected: err.message !== 'Failed to fetch' });
      return { result: null, error: err.message } as AnkiResponseBody<T>;
    });
    set({ isPending: false });
    return res;
  },
}));

export default useAnkiConnectionStore;
