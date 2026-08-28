import { Model, Draft } from '@/types/scanRule.types';
import { TFunction } from 'i18next';
import { EMPTY_DECK, EMPTY_MODEL } from '@/types/app.types';

export const getRandomColor = () => `hsl(${Math.random() * 360},50%, 50%)`;
export const getComplementaryColor = (hsl: string) => {
  hsl = hsl.replace('hsl(', '').replace(')', '');
  const [hue, saturation, lightness] = hsl.split(',').map((part) => parseFloat(part));
  const complementaryHue = (hue + 180) % 360;
  return `hsl(${complementaryHue}, ${saturation}%, ${lightness}%)`;
};
export const getCurrentTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
};

export const isNoteValid = (draft: Draft, model: Model, t: TFunction<'error', 'addNote'>) => {
  console.log(draft, model);
  const res = {
    result: 'error',
    error: [] as string[],
  };
  if (model === null || model === undefined || model.id === EMPTY_MODEL.id) {
    res.error.push(t('modelNotFoundError.code'));
  }
  if (
    draft.modelId === '' ||
    draft.modelId === null ||
    draft.modelId === undefined ||
    draft.modelId === EMPTY_MODEL.id
  ) {
    res.error.push(t('emptyModelError.code'));
  }
  if (
    draft.deckId === '' ||
    draft.deckId === null ||
    draft.deckId === undefined ||
    draft.deckId === EMPTY_DECK.name
  ) {
    res.error.push(t('emptyDeckError.code'));
  }
  if (res.error.length > 0) return res;
  //check model fields == note fields
  const modelFieldNames = Object.keys(model.fields);
  const noteFieldNames = Object.keys(draft.fields);
  if (
    modelFieldNames.length !== noteFieldNames.length ||
    !modelFieldNames.every((field) => noteFieldNames.includes(field))
  ) {
    res.error.push(t('fieldModelMismatchError.code'));
  }
  if (res.error.length === 0) {
    res.result = 'ok';
  }
  return res;
};
