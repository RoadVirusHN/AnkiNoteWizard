import { FetchAnkiRequestBody } from '@/types/app.types';
import { Deck, Model } from '@/types/scanRule.types';
import { create } from 'zustand';

interface AnkiResponseBody<T = unknown> {
  result: T;
  error: string | null;
}
interface AnkiConnectionState {
  isConnected: boolean;
  isPending: boolean;
  decks: { [deckIds: string]: Deck };
  models: { [modelIds: string]: Model };
  ankiUrl: string;
  setAnkiUrl: (url: string) => void;
  checkConnection: () => Promise<void>;
  fetchModels: () => Promise<void>;
  fetchAnki: <T>(request: FetchAnkiRequestBody) => Promise<AnkiResponseBody<T>>;
}

const callAnki = async <T>(
  ankiUrl: string,
  request: FetchAnkiRequestBody
): Promise<AnkiResponseBody<T>> => {
  const res = await fetch(ankiUrl, {
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
  decks: {},
  models: {},
  ankiUrl: 'http://127.0.0.1:8765',
  setAnkiUrl: (url: string) => set({ ankiUrl: url }),
  checkConnection: async () => {
    console.log('Checking Anki connection...');
    if (get().isPending) return;
    set({ isPending: true });
    const res = await callAnki<string[]>(get().ankiUrl, { action: 'deckNames' })
      .catch((err) => {
        set({ isPending: false, isConnected: false, decks: {} });
        return { result: null, error: err.message };
      })
      .then((res) => {
        get().fetchModels();
        return { result: res.result, error: res.error };
      });
    if (res.error) {
      set({ isPending: false, isConnected: false, decks: {} });
      return;
    }

    const newDecks: { [deckIds: string]: Deck } = {};
    res.result?.forEach((deckName) => {
      if (deckName === 'Default') return;
      newDecks[deckName] = { name: deckName };
    });
    set({ isPending: false, isConnected: !res.error, decks: res.result ? newDecks : {} });
  },
  fetchModels: async () => {
    const modelNamesAndIds = await callAnki<{ [modelNames: string]: number }>(get().ankiUrl, {
      action: 'modelNamesAndIds',
    }).catch((err) => {
      set({ isPending: false, isConnected: false, decks: {} });
      return { result: null, error: err.message };
    });
    let newModels: { [modelIds: string]: Model } = {};
    const modelNames = Object.keys(modelNamesAndIds.result || {});
    for (const modelName of modelNames) {
      let fields = (
        await callAnki<string[]>(get().ankiUrl, {
          action: 'modelFieldNames',
          params: { modelName },
        }).catch((err) => {
          set({ isPending: false, isConnected: false, decks: {} });
          return { result: null, error: err.message };
        })
      ).result || [];
  
      let style = (
        await callAnki<string>(get().ankiUrl, {
          action: 'modelStyling',
          params: { modelName },
        }).catch((err) => {
          set({ isPending: false, isConnected: false, decks: {} });
          return { result: null, error: err.message };
        })
      ).result || '';
      newModels[modelNamesAndIds.result![modelName]] = {
        name: modelName,
        id: String(modelNamesAndIds.result![modelName]),
        fields,
        style,
      };
    }
    set({ models: newModels });
  },
  fetchAnki: async <T>(request: FetchAnkiRequestBody) => {
    if (get().isConnected === false) return Promise.reject('Anki is not connected');
    if (get().isPending) return Promise.reject('Another request is pending');
    set({ isPending: true });
    const res = await callAnki<T>(get().ankiUrl, request).catch((err) => {
      set({ isPending: false, isConnected: err.message !== 'Failed to fetch' });
      return { result: null, error: err.message } as AnkiResponseBody<T>;
    });
    set({ isPending: false });
    return res;
  },
}));

export default useAnkiConnectionStore;
