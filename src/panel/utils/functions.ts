import { Model, Draft } from '@/types/scanRule.types';
import useAnkiConnectionStore from '../stores/useAnkiConnectionStore';
import { ChangeEventHandler } from 'react';
import i18next, { TFunction } from 'i18next';
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

export const isNoteValid = (draft: Draft, model: Model, t: TFunction<"error", "addNote">) => {
  const res = {
    result: 'error',
    error: [] as string[],
  };
  if (model === null || model === undefined || model.id === EMPTY_MODEL.id) {
    res.error.push(t('modelNotFoundError.code'));
  }
  if (draft.modelId === '' || draft.modelId === null || draft.modelId===undefined || draft.modelId === EMPTY_MODEL.id){
    res.error.push(t('emptyModelError.code'));
  }
  if (draft.deckId === '' || draft.deckId === null || draft.deckId===undefined||draft.deckId === EMPTY_DECK.name){
    res.error.push(t('emptyDeckError.code'));
  }
  if (res.error.length>0) return res;
  //check model fields == note fields
  const modelFieldNames = Object.keys(model.fields);
  const noteFieldNames = Object.keys(draft.fields);
  if (
    modelFieldNames.length !== noteFieldNames.length ||
    !modelFieldNames.every((field) => noteFieldNames.includes(field))
  ) {
    res.error.push(t('fieldModelMismatchError.code'));
  }
  if (res.error.length === 0){
    res.result = 'ok';
  }
  return res;
};

const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result는 "data:image/png;base64,iVBORw..." 형태이므로 앞의 메타데이터를 제거합니다.
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Anki에 노트 추가 시 미디어 파일이 포함된 경우, HTML 내의 미디어 태그를 Anki의 미디어 저장 방식에 맞게 변환하여 처리
export const processMediaInHtml = async (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const mediaElements = doc.querySelectorAll('img, audio, video');

  for (const element of Array.from(mediaElements)) {
    const src = element.getAttribute('src');
    if (!src) continue;

    let filename;
    if (element.tagName.toLowerCase() === 'img') {
      filename = 'pasted_image.png';
    } else if (element.tagName.toLowerCase() === 'audio') {
      filename = 'pasted_audio.mp3';
    } else if (element.tagName.toLowerCase() === 'video') {
      filename = 'pasted_video.mp4';
    } else {
      console.warn('Unsupported media type:', element.tagName);
      continue;
    }

    let params = {
      filename,
      deleteExisting: false,
    } as  {filename:string, deleteExisting: boolean, url?: string, data?: string};

    if (src.startsWith('blob:')) {
      try {
        const base64Data = await blobUrlToBase64(src);
        params.data = base64Data; // 'url' 대신 'data'를 사용합니다.
      } catch (err) {
        console.error('Failed to convert blob to base64:', err);
        alert(i18next.t('error:common.storeMediaError') + ': Base64 변환 실패');
        return { result: 'error', error: 'base64_conversion_failed', data: '' };
      }
    } else {
      // 일반 웹 URL(http://, https://)인 경우는 기존처럼 url로 요청 가능
      params.url = src;
    }

    const ankiStore = useAnkiConnectionStore.getState(); 
    
    let res = await ankiStore
      .fetchAnki({
        action: 'storeMediaFile',
        params,
      })
      .then((res) => {
        if (res.result) {
          element.setAttribute('src', res.result as string);
          
          // 💡 메모리 누수 방지: Anki에 업로드가 끝난 임시 blob URL은 메모리에서 해제해 줍니다.
          if (src.startsWith('blob:')) {
            URL.revokeObjectURL(src);
          }
        } else if (res.error) {
          console.error('Error storing media file:', res.error);
          return { result: 'error', error: res.error }; 
        }
        console.log("storeMediaResult:",res);
        return res;
      })
      .catch((err) => {
        console.error('Failed to store media file:', err);
        return { result: 'error', error: err.message };
      });
      if (res.result === 'error') {
        alert(i18next.t('error:common.storeMediaError') + `: ${res.error}`);
        return {result: 'error', error: res.error, data: ''};
      }
  }
  return {result: 'ok', error: null, data: doc.body.innerHTML};
};

const insertTextAtCursor = (input: HTMLTextAreaElement, text: string) => {
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const value = input.value;
  input.value = value.slice(0, start) + text + value.slice(end);
  input.selectionStart = input.selectionEnd = start + text.length;
};

export const onFieldPaste =
  (onChange: ChangeEventHandler<HTMLTextAreaElement>) =>
  async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 복사된 내용이 미디어(이미지, 비디오, 음성 등)일 경우 태그로 변환하여 입력
    event.preventDefault();
    const items = event.clipboardData.items;
    console.log(items);
    insertTextAtCursor(event.currentTarget, handleDataTransferItemsList(items));
    const fakeEvent = {
      ...event,
      target: event.target,
      currentTarget: event.currentTarget,
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
  
    onChange(fakeEvent); // Trigger onChange to update state
  };

export const onFieldDrop =
  (onChange: ChangeEventHandler<HTMLTextAreaElement>) =>
  async (event: React.DragEvent<HTMLTextAreaElement>) => {
    // 드래그한 파일이 미디어(이미지, 비디오, 음성 등)일 경우 태그로 변환하여 입력
    event.preventDefault();
    const items = event.dataTransfer.items;
    console.log(items);
    insertTextAtCursor(event.currentTarget, handleDataTransferItemsList(items));
    const fakeEvent = {
    ...event,
    target: event.target,
    currentTarget: event.currentTarget,
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(fakeEvent); // Trigger onChange to update state
  };

export const handleDataTransferItemsList = (items: DataTransferItemList) => {
  let result = '';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) {
        if (item.type.startsWith('image/')) {
          result += `<img src="${URL.createObjectURL(file)}" alt="${file.name}" />`;
        } else if (item.type.startsWith('audio/')) {
          result += `<audio src="${URL.createObjectURL(file)}" controls />`;
        } else if (item.type.startsWith('video/')) {
          result += `<video src="${URL.createObjectURL(file)}" controls/>`;
        } else {
          console.log('지원되지 않는 파일 형식:', item.type);
        }
      }
    }
  }
  return result;
};
