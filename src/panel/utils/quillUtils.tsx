import i18next from 'i18next';
import useAnkiConnectionStore from '../stores/useAnkiConnectionStore';
import localforage from 'localforage';
import Quill, { Delta } from 'quill';
import Embed from 'quill/blots/embed';
import Image from 'quill/formats/image';
import { createRoot } from 'react-dom/client';
import VidPlayer from "@/panel/components/VidPlayer/VidPlayer";
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import Toolbar from 'quill/modules/toolbar';


// export class ToolbarAlt extends Toolbar {
//   resetToolbar () {
//     this.container?.childNodes.forEach(el => {
//       const clone = el.cloneNode(true);
//       el.parentNode?.replaceChild(clone, el);
//     });
//     this.container?.childNodes.forEach((input) => {
//       this.attach(input as HTMLElement);
//     }, this);
//   }
    //   if (!this.container) return;
    // const controls = this.container.querySelectorAll('button, select, input, .ql-picker');
    // controls.forEach((el) => {
    //   const clone = el.cloneNode(true);
    //   el.parentNode?.replaceChild(clone, el);
    // });
    // const renewedControls = this.container.querySelectorAll('button, select, input');
    // renewedControls.forEach((control) => {
    //   this.attach(control as HTMLElement);
    // });
// }

const ANKI_IMAGE_BLOT_NAME = 'anki-image';
const ANKI_SOUND_BLOT_NAME = 'anki-sound';
export const initQuill = () => {
  class AnkiSoundBlot extends Embed {
    static create(value: { src: string; mediaId: string }) {
      const node = super.create() as HTMLElement;
      const {src, mediaId} = value;
      node.setAttribute('data-file', mediaId);
      node.setAttribute('src', src);
      node.setAttribute('contenteditable', 'false');
      node.className = 'anki-sound-tag';
      node.innerHTML = `[sound:${mediaId}]<span class="${detectedDraftStyles['sound-click-zone']}" style="margin-left: 4px; cursor: pointer;">🔊</span>`;
     
      // 클릭 시 비디오/오디오 실행
      node.querySelector(`[class*="${detectedDraftStyles['sound-click-zone']}"]`)?.addEventListener('mousedown', clickSoundHandler(node, src, mediaId));

      return node;
    }

    // getContents() 호출 시 Delta 안에 박힐 값 정의
    static value(node: HTMLElement) {
      return  { mediaId: node.getAttribute('data-file') || '', src: node.getAttribute('src') || ''};
    }
  }

  AnkiSoundBlot.blotName = ANKI_SOUND_BLOT_NAME;
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
  AnkiImageBlot.blotName = ANKI_IMAGE_BLOT_NAME;
  AnkiImageBlot.tagName = 'IMG';
  Quill.register(AnkiImageBlot, true);



    //  Quill.register('modules/toolbar', ToolbarAlt, true);
};
const clickSoundHandler = (node: HTMLElement, src: string, mediaId: string) => async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('clickSoundHandler', node, src, mediaId);
  const clickZone = e.currentTarget as HTMLElement;
  try {
    const fileName = node.getAttribute('data-file');
    if (!fileName) {
      //TODO : i18n
      alert(i18next.t('error:media.mediaFileNotFound'));
      console.error('미디어 파일을 찾을 수 없습니다');
      return;
    }
    const playUrl = src;
    const shouldRevoke = true; // 팝업 창이 닫힐 때 Blob URL을 해제할지 여부

    // 파일명을 기반으로 확장자 추출 (쿼리 스트링 제거 안전장치 포함)
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    console.log(extension, fileName);
    if (extension && videoExtensions.includes(extension)) {
      // 🎬 2. 비디오 파일 처리 분기 (새창 팝업)
      console.log("video processing");
      // 팝업 창의 크기 및 옵션 설정
      const popupWidth = 800;
      const popupHeight = 600;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;
      
      const popupWindow = window.open(
        '', 
        `AnkiVideoPlayer_${mediaId}`, 
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=no,resizable=yes`
      );

      if (popupWindow) {
        // 새 창 내부에 HTML5 비디오 플레이어를 주입하여 자동 재생 (`autoplay`)
        popupWindow.document.write(`
          <html>
            <head>
              <title>Anki Video Player - ${mediaId}</title>
            </head>
            <body style="margin:0; background:#000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden;">
              <div id="popup-root"></div>
            </body>
          </html>
        `);
        popupWindow.document.close();
        const container = popupWindow.document.getElementById('popup-root');
        if (container){
          const root =createRoot(container);
          root.render(<VidPlayer playUrl={playUrl} shouldRevoke={shouldRevoke as boolean} />);
        }
      } else {
        alert(i18next.t('error:common.popupBlocked'));
      }
    } else if (extension && audioExtensions.includes(extension)) {
      // 🎵 1. 오디오 파일 처리 분기
      // 이미 재생 중인 경우 중복 실행 방지 및 깜빡임 클래스 추가
      console.log("audio processing");
      if (clickZone.classList.contains('anki-playing-blink')) return;
      clickZone.classList.add('anki-playing-blink');

      const audio = new Audio(playUrl);
      audio.play();

      // 재생이 끝나면 깜빡임 멈추고 메모리 해제
      audio.onended = () => {
        clickZone.classList.remove('anki-playing-blink');
        if (shouldRevoke) {
          URL.revokeObjectURL(playUrl);
        }
      };
      
      // 에러 발생 시에도 깜빡임 해제
      audio.onerror = () => {
        clickZone.classList.remove('anki-playing-blink');
        if (shouldRevoke) {
          URL.revokeObjectURL(playUrl);
        }
      };

    } 
  } catch (err) {
    console.error('미디어 재생 실패:', err);
    alert(i18next.t('error:media.playMediaFail') + `: ${err}`);
    clickZone.classList.remove('anki-playing-blink');
  }
};
const imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg+xml', 'bmp', 'tiff', 'avif'];
const audioExtensions = ['mpeg', 'ogg', 'wav', 'webm', 'aac', 'flac', 'm4a', 'mp4', 'x-m4a'];
const videoExtensions = ['mp4', 'webm', 'ogg', 'quicktime', 'x-msvideo', 'mpeg'];

export const getEditorQuill = (editorElement: HTMLElement, toolbarElement: HTMLElement, makeDirty:()=>void) => {
  const editorQuill = new Quill(editorElement, {
    debug: 'warn',
    theme: 'snow',
    modules: {
      toolbar: toolbarElement,
      uploader: {
        mimetypes: [...imageExtensions.map((ext) => `image/${ext}`), ...audioExtensions.map((ext) => `audio/${ext}`), ...videoExtensions.map((ext) => `video/${ext}`)],
        handler: async function (range: { index: number }, files: File[]) {
          let currentIndex = range.index;
          for (const file of files) {
            const ext = file.type.split('/')[1] || 'bin';
            const mediaId = `anki_media_${Date.now()}_${Math.random().toString(36).substring(2, 5)}.${ext}`;
            //await localforage.setItem(mediaId, file);
            const tempUrl = URL.createObjectURL(file);
            
            if (file.type.startsWith('image/')) {
              editorQuill.insertEmbed(currentIndex, ANKI_IMAGE_BLOT_NAME, {
                src: tempUrl,
                mediaId,
              });
              currentIndex += 1;
              makeDirty();
            } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
              // 사운드도 임베드 데이터 형식으로 삽입
              editorQuill.insertEmbed(currentIndex, ANKI_SOUND_BLOT_NAME, {src: tempUrl, mediaId});
              currentIndex += 1;
              makeDirty();
            }
          }
        },
      },
    },
  });
  editorQuill.clipboard.addMatcher('IMG', (node: Node, delta) => {
    const imgNode = node as HTMLImageElement;
    const src = imgNode.getAttribute('src') || '';
    // 주소창이 'anki_media_'로 시작하는 원본 파일명이거나 data-file이 있으면 Blot으로 인지
    if (src.startsWith('anki_media_') || imgNode.hasAttribute('data-file')) {
      const mediaId = imgNode.getAttribute('data-file') || src;
      return new Delta().insert({
        [ANKI_IMAGE_BLOT_NAME]: { src, mediaId }
      });
    }
    return delta;
  });
  editorQuill.clipboard.addMatcher(Node.TEXT_NODE, (node: Node, delta) => {
    const regex = /\[sound:([^\]]+)\]/g;
    const text = node.textContent || '';
    if (regex.test(text)) {
      const newDelta = new Delta();
      let lastIndex = 0;
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          newDelta.insert(text.substring(lastIndex, match.index));
        }
        const pureMediaId = match[1].trim();
        newDelta.insert({ 
          [ANKI_SOUND_BLOT_NAME]: { mediaId: pureMediaId, src: '' } 
        });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < text.length) {
        newDelta.insert(text.substring(lastIndex));
      }
      return newDelta;
    }
    return delta;
  });
  return editorQuill;
};

export const addNewMediaTags = async (editorQuill: Quill) => {
  const currentContents = editorQuill.getContents();
  const currentMediaIdNUrls = {} as Record<string, string>;

  currentContents.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && ANKI_IMAGE_BLOT_NAME in op.insert) {
      const imgData = op.insert[ANKI_IMAGE_BLOT_NAME] as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        currentMediaIdNUrls[imgData.mediaId] = imgData.src || '';
      }
    } else if (op.insert && typeof op.insert === 'object' && ANKI_SOUND_BLOT_NAME in op.insert) {
      const soundData = op.insert[ANKI_SOUND_BLOT_NAME] as {src: string; mediaId: string;};
      if (soundData) {
        currentMediaIdNUrls[soundData.mediaId] = soundData.src; 
      }
    }
  });
  await Object.keys(currentMediaIdNUrls).forEach(async (mediaId) => {
    const blobUrl = currentMediaIdNUrls[mediaId];
    const file = blobUrl.startsWith('blob:') ? await fetch(blobUrl).then((res) => res.blob()) : null;
    if (!file) return;
    await localforage.setItem(mediaId, file);
  });
  
};


export const removeDeletedMediaTags = (editorQuill: Quill, oldDelta: Delta) => {
  const oldMediaIds: string[] = [];
  oldDelta.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && ANKI_IMAGE_BLOT_NAME in op.insert) {
      const imgData = op.insert[ANKI_IMAGE_BLOT_NAME] as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        oldMediaIds.push(imgData.mediaId);
      }
    } else if (op.insert && typeof op.insert === 'object' && ANKI_SOUND_BLOT_NAME in op.insert) {
      const soundData = op.insert[ANKI_SOUND_BLOT_NAME] as {src: string; mediaId: string;};
      if (soundData) {
        oldMediaIds.push(soundData.mediaId);
      }
    }
  });

  const currentContents = editorQuill.getContents();
  const currentMediaIds = new Set<string>();

  currentContents.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && ANKI_IMAGE_BLOT_NAME in op.insert) {
      const imgData = op.insert[ANKI_IMAGE_BLOT_NAME] as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        currentMediaIds.add(imgData.mediaId);
      }
    } else if (op.insert && typeof op.insert === 'object' && ANKI_SOUND_BLOT_NAME in op.insert) {
      const soundData = op.insert[ANKI_SOUND_BLOT_NAME] as {src: string; mediaId: string;};
      if (soundData) {
        currentMediaIds.add(soundData.mediaId);
      }
    }
  });
  oldMediaIds.forEach((oldId) => {
    if (!currentMediaIds.has(oldId)) {
      localforage
        .removeItem(oldId)
        .then(() => {
          console.log(`DB Media file deleted: ${oldId}`);
        })
        .catch((err) => {
          console.error('DB Media file failed to delete:', err);
        });
    }
  });
};
export function deleteAllMediaTags(editorQuill: Quill) {
  const currentContents = editorQuill.getContents();
  const mediaIdsToDelete: string[] = [];

  currentContents.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && ANKI_IMAGE_BLOT_NAME in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string };
      if (typeof imgData === 'object' && imgData.mediaId) {
        mediaIdsToDelete.push(imgData.mediaId);
      }
    } else if (op.insert && typeof op.insert === 'object' && ANKI_SOUND_BLOT_NAME in op.insert) {
      const soundData = op.insert[ANKI_SOUND_BLOT_NAME] as {src: string; mediaId: string};
      if (soundData) {
        mediaIdsToDelete.push(soundData.mediaId);
      }
    }
  });

  mediaIdsToDelete.forEach((mediaId) => {
    localforage
      .removeItem(mediaId)
      .then(() => {
        console.log(`DB 미디어 자원 삭제: ${mediaId}`);
      })
      .catch((err) => {
        console.error('DB 자원 삭제 실패:', err);
      });
  });
}
function extractAnkiSoundFiles(htmlString: string): string[] {
  const soundRegex = /\[sound:([^\]]+)\]/g;
  const fileNames: string[] = [];
  let match;
  while ((match = soundRegex.exec(htmlString)) !== null) {
    fileNames.push(match[1].trim());
  }
  return fileNames;
}

export const processMediaInHtml = async (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let mediaElements = Array.from(doc.querySelectorAll('img, audio, video')).map((element) => {
    return {
      tagName: element.tagName.toLowerCase(),
      src: element.getAttribute('src'),
      node: element
    };
  });

  const soundReplacements: Record<string, string> = {};
  
  extractAnkiSoundFiles(html).forEach((fileName) => {
    mediaElements.push({
      tagName: 'sound',
      src: fileName,
      node: null as any
    });
  });

  let errors = [] as { error: string; src: string }[];
  for (const element of mediaElements) {
    const src = element['src'];
    if (!src) continue;

    let params = {
      deleteExisting: false,
    } as { filename: string; deleteExisting: boolean; url?: string; data?: string };

    const tagName = element.tagName.toLowerCase();
    let extension: string | undefined = undefined;

    // 외부 URL 주소 -> 의도적 주입으로 판단하여 업로드 스킵
    if (src.startsWith('http://') || src.startsWith('https://')) {
      continue;
    } 
    
    // 로컬 임시 Blob URL -> 데이터 추출 후 전송 준비
    else if (src.startsWith('blob:')) {
      let base64;
      try {
        const file = await fetch(src).then((res) => res.blob());
        if (!file) {
          errors.push({ error: i18next.t('error:media.fetchMediaError'), src });
          continue;  
        }
        base64 = await fileToBase64(file as File);
               
        extension = file.type.split('/')[1] || 'png';
        params.data = base64;
      } catch (err) {
        console.error('Failed to convert blob to base64:', err);
        errors.push({ error: i18next.t('error:media.base64Error.statusText'), src });
        continue;
      }
    } 
    
    // Data URI (Base64 원격 주소) -> 의도적 주입으로 판단하여 업로드 스킵
    else if (src.startsWith('data:')) {
      continue;
    } 
    
    // file:// 접근 불가 주소 -> 에러 수집 후 패스
    else if (src.startsWith('file://')) {
      console.warn('Unsupported media type (file URL):', src);
      errors.push({ error: i18next.t('error:media.unsupportedSrcFormatError.statusText') + ": 'file://'", src });
      continue;
    } 
    
    // 순수 파일명 -> LocalForage에서 파일 추적 후 복구 전송
    else {
      if (tagName === 'img') {
        imageExtensions.forEach((ext) => { if (src.endsWith(`.${ext}`)) extension = ext; });
      } else if (tagName === 'video' || tagName === 'sound') {
        audioExtensions.forEach((ext) => { if (src.endsWith(`.${ext}`)) extension = ext; });
        videoExtensions.forEach((ext) => { if (src.endsWith(`.${ext}`)) extension = ext; });
      } else if (tagName === 'audio') {
        audioExtensions.forEach((ext) => { if (src.endsWith(`.${ext}`)) extension = ext; });
      }

      try {
        const file = await localforage.getItem<File>(src);
        if (!file) {
          errors.push({ error: i18next.t('error:media.mediaFileNotFound'), src });
          continue; 
        }
        params.data = await fileToBase64(file);
      } catch (err) {
        console.error('Failed to read from localforage:', err);
        errors.push({ error: i18next.t('error:media.mediaFileNotFound'), src });
        continue;
      }
    }

    // 의도적으로 중복된 파일명을 이용해서 AnkiConnect가 중복 파일 회피 처리하도록 유도
    let filename;
    if (tagName === 'img') {
      filename = 'pasted_image.' + (extension || 'png');
    } else if (tagName === 'audio') {
      filename = 'pasted_audio.' + (extension || 'mp3');
    } else if (tagName === 'video' || tagName === 'sound') {
      filename = 'pasted_video.' + (extension || 'mp4');
    } else {
      continue;
    }
    params.filename = filename;

    // AnkiConnect 통신 수행
    const ankiStore = useAnkiConnectionStore.getState();
    try {
      const res = await ankiStore.fetchAnki<string>({
        action: 'storeMediaFile',
        params,
      });
      if (res.error) {
        console.error('Failed to store media file:', res.error);
        errors.push({ error: i18next.t('error:media.storeMediaError') + `: ${res.error}`, src });
        continue;
      }

      const finalSavedName = res.result; // 안키가 최종 확정해준 진짜 중복 회피 파일명

      if (tagName === 'img' || tagName === 'audio' || tagName === 'video') {
        element.node.setAttribute('src', finalSavedName);
      } else if (tagName === 'sound') {
        // [sound:...] 치환 목록 매핑 테이블에 킵
        soundReplacements[src] = finalSavedName;
      }

    } catch (err: any) {
      console.error('AnkiConnect fetch crash:', err);
      errors.push({ error: i18next.t('error:media.storeMediaError') + `: ${err.message}`, src });
    }
  }

  // 태그 수정을 마치고 조립된 최종 HTML 문자열 추출
  let finalHtml = doc.body.innerHTML;

  // 킵해둔 사운드 파일 교체 매핑을 마지막에 문자열 일괄 치환
  Object.entries(soundReplacements).forEach(([oldSrc, newSrc]) => {
    const soundRegex = new RegExp(`\\[sound:${oldSrc.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
    finalHtml = finalHtml.replace(soundRegex, `[sound:${newSrc}]`);
  });

  return { result: 'ok', errors, data: finalHtml };
};

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(',')[1]); // 💡 AnkiConnect 전송용 헤더 제거 처리까지 한방에 끝!
    r.onerror = rej;
    r.readAsDataURL(file);
  });

export function convertQuillToAnkiPureHtml(quillInstance: Quill): string {
  const delta = quillInstance.getContents();
  let resultHtml = "";

  delta.ops.forEach((op, index) => {
    if (typeof op.insert === 'string') {
      let text = op.insert;

      const isLastOp = index === delta.ops.length - 1;
      if (isLastOp && text.endsWith('\n')) {
        text = text.slice(0, -1); // 맨 끝 \n 하나만 정확히 제거
      }
      resultHtml += text.replace(/\n/g, '<br>');
      return;
    }

    if (op.insert && typeof op.insert === 'object') {
      if (ANKI_IMAGE_BLOT_NAME in op.insert) {
        const imgData = op.insert[ANKI_IMAGE_BLOT_NAME] as { src?: string; mediaId?: string } | string;
        const mediaId = typeof imgData === 'object' ? imgData.mediaId : '';
        if (mediaId) resultHtml += `<img src="${mediaId}">`;
      } 
      else if (ANKI_SOUND_BLOT_NAME in op.insert) {
        const {mediaId} = op.insert[ANKI_SOUND_BLOT_NAME] as {src: string; mediaId: string;};
        if (mediaId) resultHtml += `[sound:${mediaId}]`;
      }
    }
  });

  return resultHtml;
}

export async function restoreMediaPreviews(quillInstance: Quill) {
  const currentDelta = quillInstance.getContents();
  const newOps = [];
  for (const op of currentDelta.ops) {
    if (!op.insert || typeof op.insert !== 'object') {
      newOps.push(op);
      continue;
    }

    if (ANKI_IMAGE_BLOT_NAME in op.insert) {
      const imgData = op.insert[ANKI_IMAGE_BLOT_NAME] as { src?: string; mediaId?: string };
      const mediaId = imgData?.mediaId;
      if (mediaId) {
        const fileBlob = await localforage.getItem<Blob>(mediaId);
        if (fileBlob) {
          const liveTempUrl = URL.createObjectURL(fileBlob);
          newOps.push({
            ...op,
            insert: {
              [ANKI_IMAGE_BLOT_NAME]: { src: liveTempUrl, mediaId },
            },
          });
          continue;
        }
      }
    }

    if (ANKI_SOUND_BLOT_NAME in op.insert) {
      const soundData = op.insert[ANKI_SOUND_BLOT_NAME] as { mediaId?: string; src?: string };
      const mediaId = soundData?.mediaId;
      if (mediaId) {
        const fileBlob = await localforage.getItem<Blob>(mediaId);
        if (fileBlob) {
          const liveTempUrl = URL.createObjectURL(fileBlob);
          newOps.push({
            ...op,
            insert: {
              [ANKI_SOUND_BLOT_NAME]: { mediaId, src: liveTempUrl },
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
