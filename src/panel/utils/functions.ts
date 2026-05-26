import { Model, Note } from '@/types/scanRule.types';
import { useTranslation } from 'react-i18next';

export const getRandomColor = () => `hsl(${Math.random() * 360},50%, 50%)`;
export const getComplementaryColor = (hsl: string) => {
  // Remove the hash if it exists
  hsl = hsl.replace('hsl(', '').replace(')', '');
  const [hue, saturation, lightness] = hsl.split(',').map((part) => parseFloat(part));
  const complementaryHue = (hue + 180) % 360;
  return `hsl(${complementaryHue}, ${saturation}%, ${lightness}%)`;
};
export const getCurrentTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
};

export const isNoteValid = (note: Note, model: Model) => {
  const { t } = useTranslation('error', { keyPrefix: 'addNote' });
  if (model === undefined)
    return {
      result: 'error',
      error: t('modelNotFoundError.statusText'),
    };
  if (note.modelId === '' || note.modelId === null)
    return {
      result: 'error',
      error: t('emptyModelError.statusText'),
    };
  if (note.deckName === '' || note.deckName === null)
    return {
      result: 'error',
      error: t('emptyDeckError.statusText'),
    };
  //check model fields == note fields
  const modelFieldNames = Object.keys(model.fields);
  const noteFieldNames = Object.keys(note.fields);
  if (
    modelFieldNames.length !== noteFieldNames.length ||
    !modelFieldNames.every((field) => noteFieldNames.includes(field))
  ) {
    return {
      result: 'error',
      error: t('fieldModelMismatchError.statusText'),
    };
  }

  return {
    result: 'success',
    error: null,
  };
};
