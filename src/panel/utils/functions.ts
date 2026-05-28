import { Model, Note } from '@/types/scanRule.types';
import { useTranslation } from 'react-i18next';
import useAnkiConnectionStore from '../stores/useAnkiConnectionStore';

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

export const processMediaInHtml = async (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const mediaElements = doc.querySelectorAll('img, audio, video');
  for (let i = 0; i < mediaElements.length; i++) {
    const element = mediaElements[i];
    const src = element.getAttribute('src');
    if (!src) continue;
    const mimeType = element instanceof HTMLImageElement ? 'image/png' : 'application/octet-stream';
    let params = { filename: await generateFilename(src, mimeType) } as Record<string, string|Blob>;
    if (src.startsWith('http')) {
      // 외부 URL
      params.url = src;
    } else if (src.startsWith('data:')) {
      // base64 인코딩된 데이터 URI
      params.data = await fetch(src).then((res) => res.blob());
    } else if (src.startsWith('file://')) {
      // 로컬 파일 경로
      params.data = await fetch(src).then((res) => res.blob());
    } else if (src.startsWith('blob:')) {
      // Blob URL
      params.data = await fetch(src).then((res) => res.blob());
    } else {
      // 상대 경로 (현재 페이지 기준), 절대 경로 (도메인 루트 기준) 등 다양한 형태가 있을 수 있음
      params.path = src;
    }
    useAnkiConnectionStore()
      .fetchAnki({
        action: 'storeMediaFile',
        params,
      })
      .then((res) => {
        if (res.result) {
          element.setAttribute('src', res.result as string);
        }
      }).catch((err) => {
        console.error('Failed to store media file:', err);
        alert(`Failed to store media file: ${err.message}`);
        return { result: 'error', error: err.message };
      });
  }
  return doc.body.innerHTML;
};

const generateFilename = async (src: string, mimeType: string) => {
  const ext = mimeType.split('/')[1] || 'jpg';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(src));
  const hashHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
  return `paste-${hashHex}.${ext}`;
};

// export const onPaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
//   // 복사된 내용이 미디어(이미지, 비디오, 음성 등)일 경우 태그로 변환하여 입력
//   console.log("paste Result : ", event.clipboardData.getData('text/plain'));
//   console.log("paste Result : ", event.clipboardData.getData('text/html'));
//   console.log("paste Result : ", event.clipboardData.getData('img/png'));
//   const items = event.clipboardData?.items;
//   for (let i = 0; i < items.length; i++) {
//     const item = items[i];
//     console.log(item);
//   }
//     if (item.kind === 'file' && item.type.startsWith('image/')) {
//       const file = item.getAsFile(); // File 객체로 변환!
//       if (file) {
//         console.log('발견된 이미지 파일:', file.name, file.size);
//         // 여기서 파일을 서버로 업로드하거나, URL.createObjectURL로 미리보기를 만들 수 있습니다.
//       }
//     }
//   if (!items) return;  
// };