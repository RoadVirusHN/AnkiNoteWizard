import i18next from 'i18next';
import useAnkiConnectionStore from '../stores/useAnkiConnectionStore';
import localforage from 'localforage';
import Quill, { Delta } from 'quill';
import Embed from 'quill/blots/embed';
import Image from 'quill/formats/image';

export const initQuill = () => {
  class AnkiSoundBlot extends Embed {
    static create(value: { mediaId: string; src?: string } | string) {
      const node = super.create() as HTMLElement;

      // value가 문자열(mediaId)일 수도 있고, 객체({mediaId, src})일 수도 있도록 방어 코드 구성
      const mediaId = typeof value === 'string' ? value : value.mediaId;
      const src = typeof value === 'object' ? value.src : '';
      node.setAttribute('data-file', mediaId);
      if (src) node.setAttribute('data-src', src);
      node.setAttribute('contenteditable', 'false');
      node.className = 'anki-sound-tag';

      // 실제 Anki 스타일의 시각적 버튼 레이아웃 출력
      node.innerHTML = `
      <span style="display: inline-flex; align-items: center; background: #eaecf0; border: 1px solid #d0d5dd; padding: 2px 8px; border-radius: 4px; margin: 0 4px; cursor: pointer; user-select: none;" class="sound-click-zone">
        <span style="margin-right: 4px;">🔊</span>
        <code style="color: #344054; font-family: monospace;">[sound:${mediaId}]</code>
      </span>
      `;

      // 클릭 시 외부 백그라운드 오디오 플레이어 연동
      node.querySelector('.sound-click-zone')?.addEventListener('click', async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        try {
          // data-src 속성에 임시 URL이 있으면 바로 쓰고, 없으면 localforage에서 실시간 추출
          let playUrl = node.getAttribute('data-src');
          let shouldRevoke = false;

          if (!playUrl) {
            const file = await localforage.getItem<File>(mediaId);
            if (!file) return alert('미디어 파일을 찾을 수 없습니다.');
            playUrl = URL.createObjectURL(file);
            shouldRevoke = true;
          }

          const audio = new Audio(playUrl);
          audio.play();

          audio.onended = () => {
            if (shouldRevoke && playUrl) URL.revokeObjectURL(playUrl);
          };
        } catch (err) {
          console.error('오디오 재생 실패:', err);
        }
      });

      return node;
    }

    // getContents() 호출 시 Delta 안에 박힐 값 정의
    static value(node: HTMLElement) {
      return {
        mediaId: node.getAttribute('data-file') || '',
        src: node.getAttribute('data-src') || '',
      };
    }
  }

  // 중요: 델타가 'anki-sound' 키를 바인딩하도록 설정
  AnkiSoundBlot.blotName = 'anki-sound';
  AnkiSoundBlot.tagName = 'SPAN';
  Quill.register(AnkiSoundBlot, true);

  // TODO: 이미지 클릭시 스타일 변경 기능 구현.
  class AnkiImageBlot extends Embed {
    static create(value: { src: string; mediaId: string } | string) {
      const node = Image.create(typeof value === 'string' ? value : value.src);

      if (typeof value === 'object') {
        node.setAttribute('src', value.src);
        node.setAttribute('data-file', value.mediaId);
      }
      return node;
    }

    static value(node: HTMLElement) {
      return {
        src: node.getAttribute('src') || '',
        mediaId: node.getAttribute('data-file') || '',
      };
    }
  }

  // 오버라이딩 등록
  AnkiImageBlot.blotName = 'anki-image';
  AnkiImageBlot.tagName = 'IMG';
  Quill.register(AnkiImageBlot, true);
};

export const getEditorQuill = (editorElement: HTMLElement, toolbarElement: HTMLElement) => {
  const editorQuill = new Quill(editorElement, {
    debug: 'warn',
    theme: 'snow',
    modules: {
      toolbar: toolbarElement,
      uploader: {
        mimetypes: [
          // 이미지
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'image/bmp',
          'image/tiff',
          'image/avif',
          // 오디오
          'audio/mpeg',
          'audio/ogg',
          'audio/wav',
          'audio/webm',
          'audio/aac',
          'audio/flac',
          'audio/mp4',
          'audio/m4a',
          // 비디오
          'video/mp4',
          'video/webm',
          'video/ogg',
          'video/quicktime',
          'video/x-msvideo',
          'video/mpeg',
        ],
        handler: async function (range: { index: number }, files: File[]) {
          let currentIndex = range.index;
          console.log("Uploader handler called with files:", files);
          for (const file of files) {
            const ext = file.type.split('/')[1] || 'bin';
            const mediaId = `anki_media_${Date.now()}_${Math.random().toString(36).substring(2, 5)}.${ext}`;
            await localforage.setItem(mediaId, file);

            const tempUrl = URL.createObjectURL(file);

            if (file.type.startsWith('image/')) {
              console.log("process image in", editorQuill, file, mediaId, tempUrl);
              editorQuill.insertEmbed(currentIndex, 'anki-image', {
                src: tempUrl,
                mediaId: mediaId,
              });
              currentIndex += 1;
            } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
              // 사운드도 임베드 데이터 형식으로 삽입
              editorQuill.insertEmbed(currentIndex, 'anki-sound', {
                mediaId: mediaId,
                src: tempUrl, // 현재 켜져 있는 창에서 바로 들을 수 있도록 매핑
              });
              currentIndex += 1;
            }
          }
        },
      },
    },
  });

  return editorQuill;
};

export const removeDeletedMediaTags = (editorQuill: Quill, oldDelta: Delta) => {
  //TODO : video, audio 삭제시 로직도 완성하기
  const oldMediaIds: string[] = [];
  oldDelta.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        oldMediaIds.push(imgData.mediaId);
      }
    }
  });

  const currentContents = editorQuill.getContents();
  const currentMediaIds = new Set<string>();

  currentContents.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        currentMediaIds.add(imgData.mediaId);
      }
    }
  });

  oldMediaIds.forEach((oldId) => {
    if (!currentMediaIds.has(oldId)) {
      localforage
        .removeItem(oldId)
        .then(() => {
          console.log(`DB 미디어 자원 삭제: ${oldId}`);
        })
        .catch((err) => {
          console.error('DB 자원 삭제 실패:', err);
        });
    }
  });
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
  // TODO : blot 기반으로 바꾸기
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
