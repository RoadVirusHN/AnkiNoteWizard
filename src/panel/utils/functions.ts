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

export const isNoteValid = (draft: Draft, model: Model, t: TFunction<'error', 'addNote'>) => {
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

// TODO: 직접 구현하는거 다 때려치고 Quill.js로 바꾸기
const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result는 "data:image/png;base64,iVBORw..." 형태이므로 앞의 메타데이터를 제거.
      const base64String = (reader.result as string).split(',')[1];
      localMediaMap.set(blobUrl, base64String); // 전역 맵에 주소별 Base64 원본 데이터를 매핑해 성능 향상.
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
// TODO : 
// 1. 알아서 패널 닫힐 때 지워지도록 하기
// 2. 노트 저장시 순회하며 모든 URL revokeObjectURL() 호출하여 메모리 해제
// 메모리 사용률을 모니터링해서 많아지면, 매핑과 blob url 기능을 제거하고, 이용할때마다 느리지만 fetch, base64 변환하도록 변경?
const localMediaMap: Map<string, string> = new Map();
// Anki에 노트 추가 시 미디어 파일이 포함된 경우, HTML 내의 미디어 태그를 Anki의 미디어 저장 방식에 맞게 변환하여 처리
export const processMediaInHtml = async (html: string) => {
  //TODO : Unsupported SRC with quill.js
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const mediaElements = doc.querySelectorAll('img, audio, video');

  for (const element of Array.from(mediaElements)) {
    const src = element.getAttribute('src');
    if (!src) continue;

    // src가 확장자로 끝난다면 이미 변환 완료된 상태.
    if (
      !src.startsWith('blob:') &&
      !src.startsWith('http://') &&
      !src.startsWith('https://') &&
      /\.(png|jpg|jpeg|gif|mp3|mp4|wav|ogg)$/i.test(src)
    ) {
      continue;
    }

    const tagName = element.tagName.toLowerCase();
    let filename;
    if (tagName === 'img') {
      filename = 'pasted_image.png';
    } else if (tagName === 'audio') {
      filename = 'pasted_audio.mp3';
    } else if (tagName === 'video') {
      filename = 'pasted_video.mp4';
    } else {
      console.warn('Unsupported media type:', element.tagName);
      continue;
    }

    let params = {
      filename,
      deleteExisting: false,
    } as { filename: string; deleteExisting: boolean; url?: string; data?: string };

    if (src.startsWith('blob:')) {
      try {
        const base64Data = localMediaMap.get(src) || (await blobUrlToBase64(src));
        params.data = base64Data; // 'url' 대신 'data'를 사용.
      } catch (err) {
        console.error('Failed to convert blob to base64:', err);
        alert(
          i18next.t('error:common.base64Error.statusText') +
            ' : ' +
            (
              i18next.t('error:common.base64Error.solutions', { returnObjects: true }) as string[]
            )[0]
        );
        return { result: 'error', error: 'base64_conversion_failed', data: '' };
      }
    } else if (src.startsWith('http://') || src.startsWith('https://')) {
      // 일반 웹 URL(http://, https://)인 경우는 기존처럼 url로 요청 가능
      params.url = src;
    } else {
      // 알수없는 형식 에러
      console.error('Unsupported src format:', src);
      alert(
        i18next.t('error:common.base64Error.statusText') +
          ' : ' +
          i18next.t('error:common.unsupportedSrcFormatError.statusText') +
          ' : ' +
          src
      );
    }

    const ankiStore = useAnkiConnectionStore.getState();
    console.log("storeMediaFile params:", params);
    let res = await ankiStore
      .fetchAnki({
        action: 'storeMediaFile',
        params,
      })
      .then((res) => {
        if (res.result) {
          element.setAttribute('src', res.result as string);

          // 메모리 누수 방지: Anki에 업로드가 끝난 임시 blob URL은 메모리에서 해제.
          // TODO : PREVIEW 기능 구현 후, 해제 기능 반려를 고려하고, note 삭제 시에만 해제하도록 변경 필요
          if (src.startsWith('blob:')) {
            URL.revokeObjectURL(src);
            localMediaMap.delete(src); // 전역 맵에서도 제거
          }
        } else if (res.error) {
          console.error('Error storing media file:', res.error);
          return { result: 'error', error: res.error };
        }
        console.log('storeMediaResult:', res);
        return res;
      })
      .catch((err) => {
        console.error('Failed to store media file:', err);
        return { result: 'error', error: err.message };
      });
    if (res.result === 'error') {
      alert(i18next.t('error:common.storeMediaError') + `: ${res.error}`);
      return { result: 'error', error: res.error, data: '' };
    }
  }
  return { result: 'ok', error: null, data: doc.body.innerHTML };
};

const insertTextAtCursor = (input: HTMLTextAreaElement, text: string) => {
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const value = input.value;
  input.value = value.slice(0, start) + text + value.slice(end);
  input.selectionStart = input.selectionEnd = start + text.length;
};

const checkLocalFiles = (items: DataTransferItemList): boolean => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].kind !== 'file') return false;
  }
  return true;
};
const checkInternetFiles = (items: DataTransferItemList): boolean => {
  for (let i = 0; i < items.length; i++) {
    // if (items[i]. !== 'file') return false;
  }
  return true;
};


const fileToBlobUrl = (file:File) =>  {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64String = reader.result; // 예: "data:image/png;base64,iVBOR..."
      if (typeof base64String !== 'string') return;
      const parts = base64String.split(', ');
      if (parts.length < 2) return;
      const match = parts[0].match(/:(.*?);/);
      const mime = match ? match[1] : '';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const safeBlob = new Blob([u8arr], { type: mime });
      const safeUrl = URL.createObjectURL(safeBlob);
      
      // 전역 맵에 주소별 Base64 원본 데이터를 매핑해 성능 향상.
      // 이게 없으면 나중에 Anki가 storeMediaFile하거나 프리뷰로 보여줄때, 다시 fetch 후, fileReader로 base64로 전환해야함.
      // 아님 여기서 꺼내쓰면 됨 
      localMediaMap.set(safeUrl, parts[1]); 
      console.log("new Local Media Map Entry:", safeUrl, "=>", parts[1].substring(0, 30) + "...");
      resolve(safeUrl);
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file); // 로컬 파일을 Base64로 변하게 reader에게 인식시키기
  });
}
const MAX_FILE_SIZE = 30 * 1024 * 1024;
// 파일 전용 처리 함수
export const handleLocalFiles = async (items: DataTransferItemList) => {
  let result = '';
  //TODO : 로딩 기능 구현
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          const error = i18next.getResource('error', 'addNote', 'fileTooLarge');
          throw new Error({
            ...error,
            description: `${error.description} ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
          });
        }
        await fileToBlobUrl(file).then((src)=>{
          //create a blob url of base64 image.
          if (item.type.startsWith('image/')) {
            result += `<img src="${src}" alt="${file.name}" />`;
          } else if (item.type.startsWith('audio/')) {
            result += `<audio src="${src}" controls></audio>`;
          } else if (item.type.startsWith('video/')) {
            result += `<video src="${src}" controls></video>`;
          } else {
            console.log('지원되지 않는 파일 형식:', item.type);
          }
        }).catch((err)=>{
          console.error('Failed to convert file to blob URL:', err);
          throw new Error({
            ...i18next.getResource('error', 'addNote', 'fileConversionError'),
            description: err.message,
          });
        });
      }
    }
  }
  console.log("processing files result:", result);
  return result;
};
// 로컬 파일 : item type이 file, 여러개 복붙 시, 여러 file 들어옴, size 제한 필요?
// 인터넷 파일 : item type이 여러 형식으로 들어옴, 여러개 복붙 시 거대한 html 하나만 들어옴, default를 이용하기
export const onFieldPaste =
  (onChange: ChangeEventHandler<HTMLTextAreaElement>) =>
  async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const str = await new Promise<string>((resolve) => {
        if (item.kind === 'string') {
          item.getAsString((s) => resolve(s));
        } else {
          resolve('');
        }
      });
      await console.log('Pasted file:', item.kind, item.type, item.getAsFile(), str);
    }
    const isLocalFiles = checkLocalFiles(items);
    const isInternetFiles = checkInternetFiles(items);
    // 기본 붙여넣기 방지 (파일이므로 text area에 파일명이 찍히는 것을 막음)
    if (isLocalFiles||isInternetFiles) event.preventDefault();    
    // 로컬 파일이 붙여넣기 되었는지 확인
    if (isLocalFiles) {
      const mediaTags = await handleLocalFiles(items);
      if (mediaTags) {
        insertTextAtCursor(event.currentTarget, mediaTags);

        // state 업데이트 fire 위한 가짜 이벤트 트리거 (파일 추가 시에만 필요)
        const fakeEvent = {
          ...event,
          target: event.target,
          currentTarget: event.currentTarget,
        } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(fakeEvent);
      }
    } else if (isInternetFiles) {
      const mediaTags =  "";
      // handleInternetFiles(items);

      insertTextAtCursor(event.currentTarget, mediaTags);
      const fakeEvent = {
        ...event,
        target: event.target,
        currentTarget: event.currentTarget,
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

      onChange(fakeEvent);
      //일반 텍스트일 때는 preventDefault()를 안 하고, 브라우저 기본 처리하고 리액트의 기본 onChange가 작동.
    }
  };

// 로컬 파일 : item type이 file, 여러개 드랍 시, 여러 file 들어옴, size 제한 필요?
// 인터넷 파일 : item type이 여러 형식으로 들어옴, 여러개 드랍 시 거대한 html 하나만 들어옴
export const onFieldDrop =
  (onChange: ChangeEventHandler<HTMLTextAreaElement>) =>
  async (event: React.DragEvent<HTMLTextAreaElement>) => {

    const items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const str = await new Promise<string>((resolve) => {
        if (item.kind === 'string') {
          item.getAsString((s) => resolve(s));
        } else {
          resolve('');
        }
      });
      await console.log('Pasted file:', item.kind, item.type, item.getAsFile(), str);
    }
    
    if (
      true
      //isLocalFiles(items)
      ) {
      event.preventDefault();
      
      const mediaTags = await handleLocalFiles(items);
      if (mediaTags) {
        insertTextAtCursor(event.currentTarget, mediaTags);

        const fakeEvent = {
          ...event,
          target: event.target,
          currentTarget: event.currentTarget,
        } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(fakeEvent);
      }
    }
  };
export const convertQuillToAnkiPureHtml = (quillHtml: string, outerTag='p') => {

  let cleaned = quillHtml.trim();

  const startTag = `<${outerTag}>`;
  const endTag = `</${outerTag}>`;

  const closeTagRegex = new RegExp(endTag, 'g');
  const closeTagCount = (cleaned.match(closeTagRegex) || []).length;

  if (cleaned.startsWith(startTag) && cleaned.endsWith(endTag) && closeTagCount === 1) {
    cleaned = cleaned.substring(startTag.length, cleaned.length - endTag.length);
  }
  
  else {
    const middleTagRegex = new RegExp(`${endTag}${startTag}`, 'g');
    const startTagRegex = new RegExp(`^${startTag}`);
    const endTagRegex = new RegExp(`${endTag}$`);

    cleaned = cleaned
      .replace(middleTagRegex, '<br>')  // 중간의 닫고 여는 태그 세트를 <br>로 변경
      .replace(startTagRegex, '')       // 맨 첫 줄 시작 태그 제거
      .replace(endTagRegex, '');        // 맨 마지막 줄 끝 태그 제거
  }

  const emptyLineRegex = new RegExp(`${startTag}<br>${endTag}`, 'g');
  cleaned = cleaned.replace(emptyLineRegex, '<br>');

  return cleaned;
}