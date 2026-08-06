import { Model, Draft } from '@/types/scanRule.types';
import useAnkiConnectionStore from '../stores/useAnkiConnectionStore';
import i18next, { TFunction } from 'i18next';
import { EMPTY_DECK, EMPTY_MODEL } from '@/types/app.types';
import Quill from 'quill';
import localforage from 'localforage';

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

export function extractAnkiSoundFiles(htmlString: string): string[] {
  const soundRegex = /\[sound:([^\]]+)\]/g;
  
  const fileNames: string[] = [];
  let match;

  while ((match = soundRegex.exec(htmlString)) !== null) {
    fileNames.push(match[1].trim());
  }

  return fileNames;
}

// Anki에 노트 추가 시 미디어 파일이 포함된 경우, HTML 내의 미디어 태그를 Anki의 미디어 저장 방식에 맞게 변환하여 처리
export const processMediaInHtml = async (html: string) => {
  //TODO : Unsupported SRC with quill.js
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const mediaElements = Array.from(doc.querySelectorAll('img, audio, video'));

  for (const element of mediaElements) {
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
        const File = await localforage.getItem(src) as File;
        params.data = await fileToBase64(File);
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
  // const soundFiles = extractAnkiSoundFiles(html);
  return { result: 'ok', error: null, data: doc.body.innerHTML };
};


export const fileToBase64 = (file: File): Promise<string> => 
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(',')[1]); // 💡 AnkiConnect 전송용 헤더 제거 처리까지 한방에 끝!
    r.onerror = rej;
    r.readAsDataURL(file);
  });

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

export async function restoreMediaPreviews(quillInstance: Quill) {
  // 1. 현재 에디터의 순수 Delta 상태 가져오기
  const currentDelta = quillInstance.getContents();
  
  // 2. 새롭게 주소(src)를 갱신할 목적의 빈 델타 객체 생성
  const newOps = [];

  // 3. 델타 연산 배열 순회
  for (const op of currentDelta.ops) {
    // 텍스트 등의 기본 포맷은 그대로 복사
    if (!op.insert || typeof op.insert !== 'object') {
      newOps.push(op);
      continue;
    }

    // 📸 [Case 1] 이미지 복구 대상인 경우
    if ('image' in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string };
      const mediaId = imgData?.mediaId;

      if (mediaId) {
        const fileBlob = await localforage.getItem<Blob>(mediaId);
        if (fileBlob) {
          const liveTempUrl = URL.createObjectURL(fileBlob);
          // 새로운 Blob URL로 교체된 가상 구조 주입
          newOps.push({
            ...op,
            insert: {
              image: { src: liveTempUrl, mediaId }
            }
          });
          continue;
        }
      }
    }

    // 🔊 [Case 2] 사운드 복구 대상인 경우
    if ('anki-sound' in op.insert) {
      const soundData = op.insert['anki-sound'] as { mediaId?: string; src?: string };
      const mediaId = soundData?.mediaId;

      if (mediaId) {
        const fileBlob = await localforage.getItem<Blob>(mediaId);
        if (fileBlob) {
          const liveTempUrl = URL.createObjectURL(fileBlob);
          // 임시 재생용 주소(src)를 수혈하여 새 연산에 주입
          newOps.push({
            ...op,
            insert: {
              'anki-sound': { mediaId, src: liveTempUrl }
            }
          });
          continue;
        }
      }
    }

    // 변경사항이 없는 다른 임베드 데이터는 그대로 패스
    newOps.push(op);
  }

  // 4. 조립 완료된 새 Delta 데이터를 에디터에 세팅 (화면이 일괄 리렌더링됨)
  quillInstance.setContents({ ops: newOps } as any);
  console.log("Delta 방식으로 이미지 및 사운드 프리뷰 복구 완료!");
}

export const onWebMediaDrop = (quillInstance:Quill)=> async (e: DragEvent) => {
  const dataTransfer = e.dataTransfer;
  if (!dataTransfer) return;
  const debugInfo = {
    types: Array.from(dataTransfer.types),
    filesLength: dataTransfer.files?.length,
    files: Array.from(dataTransfer.files || []).map(f => ({ name: f.name, size: f.size, type: f.type })),
    items: Array.from(dataTransfer.items || []).map(item => ({ kind: item.kind, type: item.type })),
    htmlData: dataTransfer.getData('text/html'),
    textData: dataTransfer.getData('text/plain')
  };

  console.log("🔥 [DataTransfer 실제 데이터 원본 스냅샷]:", JSON.parse(JSON.stringify(debugInfo)));

  const isRealLocalFile = dataTransfer.files && dataTransfer.files.length > 0 && dataTransfer.types.includes('Files') && !dataTransfer.types.includes('text/html');
  console.log('droop1', e, isRealLocalFile);
  if (isRealLocalFile) {
    return; 
  }
  
  e.preventDefault(); 
  e.stopPropagation();
  console.log("dropped2", e, dataTransfer.files);
  const htmlData = dataTransfer.getData('text/html');
  console.log("dropped3", e, htmlData);
  if (htmlData && htmlData.includes('<img')) {

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');
    const imgNode = doc.querySelector('img');

    if (imgNode && imgNode.src) {
      if (quillInstance) {
        const range = quillInstance.getSelection();
        const index = range ? range.index : quillInstance.getLength();
        quillInstance.insertEmbed(index, 'image', imgNode.src);
      }
    }
  }
};