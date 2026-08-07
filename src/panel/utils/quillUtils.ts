import i18next from 'i18next';
import useAnkiConnectionStore from '../stores/useAnkiConnectionStore';
import localforage from 'localforage';
import Quill, { Delta } from 'quill';

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
        const File = (await localforage.getItem(src)) as File;
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
    console.log('storeMediaFile params:', params);
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

export const convertQuillToAnkiPureHtml = (quillHtml: string, outerTag = 'p') => {
  let cleaned = quillHtml.trim();

  const startTag = `<${outerTag}>`;
  const endTag = `</${outerTag}>`;

  const closeTagRegex = new RegExp(endTag, 'g');
  const closeTagCount = (cleaned.match(closeTagRegex) || []).length;

  if (cleaned.startsWith(startTag) && cleaned.endsWith(endTag) && closeTagCount === 1) {
    cleaned = cleaned.substring(startTag.length, cleaned.length - endTag.length);
  } else {
    const middleTagRegex = new RegExp(`${endTag}${startTag}`, 'g');
    const startTagRegex = new RegExp(`^${startTag}`);
    const endTagRegex = new RegExp(`${endTag}$`);

    cleaned = cleaned
      .replace(middleTagRegex, '<br>')
      .replace(startTagRegex, '')
      .replace(endTagRegex, '');
  }

  const emptyLineRegex = new RegExp(`${startTag}<br>${endTag}`, 'g');
  cleaned = cleaned.replace(emptyLineRegex, '<br>');

  return cleaned;
};

export async function restoreMediaPreviews(quillInstance: Quill) {
  const currentDelta = quillInstance.getContents();

  const newOps = [];

  for (const op of currentDelta.ops) {
    if (!op.insert || typeof op.insert !== 'object') {
      newOps.push(op);
      continue;
    }

    if ('image' in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string };
      const mediaId = imgData?.mediaId;

      if (mediaId) {
        const fileBlob = await localforage.getItem<Blob>(mediaId);
        if (fileBlob) {
          const liveTempUrl = URL.createObjectURL(fileBlob);
          newOps.push({
            ...op,
            insert: {
              image: { src: liveTempUrl, mediaId },
            },
          });
          continue;
        }
      }
    }

    if ('anki-sound' in op.insert) {
      const soundData = op.insert['anki-sound'] as { mediaId?: string; src?: string };
      const mediaId = soundData?.mediaId;

      if (mediaId) {
        const fileBlob = await localforage.getItem<Blob>(mediaId);
        if (fileBlob) {
          const liveTempUrl = URL.createObjectURL(fileBlob);
          newOps.push({
            ...op,
            insert: {
              'anki-sound': { mediaId, src: liveTempUrl },
            },
          });
          continue;
        }
      }
    }
    newOps.push(op);
  }

  quillInstance.setContents({ ops: newOps } as Delta);
}

export const onWebMediaDrop = (quillInstance: Quill) => async (e: DragEvent) => {
  const dataTransfer = e.dataTransfer;
  if (!dataTransfer) return;
  const debugInfo = {
    types: Array.from(dataTransfer.types),
    filesLength: dataTransfer.files?.length,
    files: Array.from(dataTransfer.files || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })),
    items: Array.from(dataTransfer.items || []).map((item) => ({
      kind: item.kind,
      type: item.type,
    })),
    htmlData: dataTransfer.getData('text/html'),
    textData: dataTransfer.getData('text/plain'),
  };

  console.log('DataTransfer 데이터 :', JSON.parse(JSON.stringify(debugInfo)));

  const isRealLocalFile =
    dataTransfer.files &&
    dataTransfer.files.length > 0 &&
    dataTransfer.types.includes('Files') &&
    !dataTransfer.types.includes('text/html');
  console.log('droop1', e, isRealLocalFile);
  if (isRealLocalFile) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();
  console.log('dropped2', e, dataTransfer.files);
  const htmlData = dataTransfer.getData('text/html');
  console.log('dropped3', e, htmlData);
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
