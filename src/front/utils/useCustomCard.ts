import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum CardFieldDataType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
}

export enum CardFieldSelectorType {
  LITERAL = 'literal',
  CSSSelector = 'cssSelector',
  URL = 'url',
}

export interface CardField {
  name: string;
  content: string;
  selectorType: CardFieldSelectorType;
  dataType: CardFieldDataType;
}

export interface CustomCard {
  cardName: string;
  description: string;
  modelName: string;
  urlPatterns: string[];
  rootTag: string;
  Front: {
    html: string;
    fields: CardField[];
  };
  Back: {
    html: string;
    fields: CardField[];
  };
  tags: string[];
  audio?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string[];
  };
}
interface CustomCardState {
  customCards: CustomCard[];
  addCustomCard: (card: CustomCard) => void;
  removeCustomCard: (index: number) => void;
  modifyCustomCard: (index: number, card: CustomCard) => void;
}

const useCustomCard = create<CustomCardState>()(
  persist(
    (set) => ({
      customCards: [],
      addCustomCard: (card: CustomCard) => {
        set((state) => ({ customCards: [...state.customCards, card] }));
      },
      removeCustomCard: (index: number) => {
        set((state) => ({
          customCards: state.customCards.filter((_, i) => i !== index),
        }));
      },
      modifyCustomCard: (index: number, card: CustomCard) => {
        set((state) => ({
          customCards: state.customCards.map((c, i) => (i === index ? card : c)),
        }));
      }
    }),
    {
      name: 'anki-card-wizard-global-var-store',
      storage: {
        getItem: async (name) => (await chrome.storage.local.get(name))[name],
        setItem: async (name, value) => await chrome.storage.local.set({ [name]: value }),
        removeItem: async (name) => await chrome.storage.local.remove(name),
      },
    }
  )
);

export default useCustomCard;
