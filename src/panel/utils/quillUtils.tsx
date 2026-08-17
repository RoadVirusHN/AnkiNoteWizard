import i18next from 'i18next';
import useAnkiConnectionStore from '../stores/useAnkiConnectionStore';
import localforage from 'localforage';
import Quill, { Delta } from 'quill';
import Embed from 'quill/blots/embed';
import Image from 'quill/formats/image';
import { createRoot } from 'react-dom/client';
import VidPlayer from "@/panel/components/VidPlayer/VidPlayer";

export const initQuill = () => {
  class AnkiSoundBlot extends Embed {
    static create(mediaId: string) {
      const node = super.create() as HTMLElement;

      node.setAttribute('data-file', mediaId);
      node.setAttribute('contenteditable', 'false');
      node.className = 'anki-sound-tag';
      node.innerHTML = `[sound:${mediaId}]<span class="sound-click-zone" style="margin-left: 4px; cursor: pointer;">🔊</span>`;
   
      // // 클릭 시 비디오/오디오 실행
      node.querySelector('.sound-click-zone')?.addEventListener('click', async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        const clickZone = e.currentTarget as HTMLElement;
        console.log("media clicked!!!");
        try {
          const fileName = node.getAttribute('data-file');
          if (!fileName) {
            //TODO : i18n
            alert(i18next.t('error:media.mediaFileNotFound'));
            console.error('미디어 파일을 찾을 수 없습니다');
            return;
          }
          const file = await localforage.getItem<File>(fileName);
          if (!file) {
            console.error('미디어 파일을 찾을 수 없습니다:', fileName);
            alert(i18next.t('error:media.mediaFileNotFound'));
            return;
          }
          const playUrl = URL.createObjectURL(file);
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
            // 🎵 1. 오디오 파일 처리 분기S
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
      });

      return node;
    }

    // getContents() 호출 시 Delta 안에 박힐 값 정의
    static value(node: HTMLElement) {
      return  node.getAttribute('data-file') || '';
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
          console.log("Uploader handler called with files:", files);
          for (const file of files) {
            const ext = file.type.split('/')[1] || 'bin';
            const mediaId = `anki_media_${Date.now()}_${Math.random().toString(36).substring(2, 5)}.${ext}`;
            await localforage.setItem(mediaId, file);
            
            if (file.type.startsWith('image/')) {
              const tempUrl = URL.createObjectURL(file);
              console.log("process image in", editorQuill, file, mediaId, tempUrl);
              editorQuill.insertEmbed(currentIndex, 'anki-image', {
                src: tempUrl,
                mediaId: mediaId,
              });
              currentIndex += 1;
              makeDirty();
            } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
              // 사운드도 임베드 데이터 형식으로 삽입
              editorQuill.insertEmbed(currentIndex, 'anki-sound',mediaId);
              currentIndex += 1;
              makeDirty();
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
    if (op.insert && typeof op.insert === 'object' && 'anki-image' in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        oldMediaIds.push(imgData.mediaId);
      }
    } else if (op.insert && typeof op.insert === 'object' && 'anki-sound' in op.insert) {
      const soundData = op.insert['anki-sound'] as string;
      if (soundData) {
        oldMediaIds.push(soundData);
      }
    }
  });

  const currentContents = editorQuill.getContents();
  const currentMediaIds = new Set<string>();

  currentContents.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && 'anki-image' in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        currentMediaIds.add(imgData.mediaId);
      }
    } else if (op.insert && typeof op.insert === 'object' && 'anki-sound' in op.insert) {
      const soundData = op.insert['anki-sound'] as string;
      if (soundData) {
        currentMediaIds.add(soundData);
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
export function deleteAllMediaTags(editorQuill: Quill) {
  const currentContents = editorQuill.getContents();
  const mediaIdsToDelete: string[] = [];

  currentContents.ops.forEach((op) => {
    if (op.insert && typeof op.insert === 'object' && 'anki-image' in op.insert) {
      const imgData = op.insert.image as { src?: string; mediaId?: string } | string;
      if (typeof imgData === 'object' && imgData.mediaId) {
        mediaIdsToDelete.push(imgData.mediaId);
      }
    } else if (op.insert && typeof op.insert === 'object' && 'anki-sound' in op.insert) {
      const soundData = op.insert['anki-sound'] as string;
      if (soundData) {
        mediaIdsToDelete.push(soundData);
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

// Anki에 노트 추가 시 미디어 파일이 포함된 경우, HTML 내의 미디어 태그를 Anki의 미디어 저장 방식에 맞게 변환하여 처리
export const processMediaInHtml = async (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let mediaElements = Array.from(doc.querySelectorAll('img, audio, video')).map((element)=>{
    return {
      tagName : element.tagName.toLowerCase(),
      src: element.getAttribute('src'),
      node: element
    }
  });
  extractAnkiSoundFiles(html).forEach((fileName) => {
    mediaElements.push({
      tagName: 'sound',
      src:fileName,
      node: null as any
    });
  });
  let errors = [] as {error:string;src:string;}[];
  for (const element of mediaElements) {
    const src = element['src'];
    if (!src) continue;

    let params = {
      deleteExisting: false,
    } as { filename: string; deleteExisting: boolean; url?: string; data?: string };

    const tagName = element.tagName.toLowerCase();
    let extension;
    if (src.startsWith('http://') || src.startsWith('https://')) {
      continue;
      // 외부 파일이면 storeMediaFile 시, 헤더 파일 확인 후, url로 요청
      // 일단 외부 링크면 storeMedia를 보류하기로 했음, 나중에 원복 시 아래코드 참조.
      // const res = await fetch(src, { method: 'HEAD' });
      // if (!res.ok) {
      //   console.error('Failed to fetch media file header:', res.status, res.statusText);
      //   errors.push({ error: i18next.t('error:media.fetchMediaError'), src });
      //   continue;
      // } else {
      //   const contentType = res.headers.get('Content-Type');
      //   if (contentType) {
      //     extension = contentType.split('/')[1];
      //   } else {
      //     console.warn('Content-Type header not found for:', src);
      //     errors.push({ error: i18next.t('error:media.contentHeaderError'), src });
      //     continue;
      //   }
      // }
      // params.url = src;
    } else if (src.startsWith('blob:')){
      // blob일 경우 blob url에서 파일 추출 후, base64로 변환 후, storeMediaFile로 요청
      let base64;
      const file = await fetch(src).then((res) => res.blob());
      if (!file) {
        errors.push({ error: i18next.t('error:media.fetchMediaError'), src });
        continue;  
      }
      try {
        base64 = await fileToBase64(file as File);
      } catch (err) {
        console.error('Failed to convert blob to base64:', err);
        errors.push({ error: i18next.t('error:media.base64Error.statusText'), src });
      }
      extension = file.type.split('/')[1];
      params.data = base64;
    } else if (src.startsWith('data:')) {
      // data URL일 경우 base64로 변환 후, storeMediaFile로 요청
      // 일단 사용자가 의도적으로 data를 넣은 경우 storeMedia를 보류하기로 했음, 나중에 원복 시 아래코드 참조.
      continue;
      // extension = src.split(';')[0].split('/')[1];
      // params.data = src.split(',')[1];

    } else if (src.startsWith('file://')) {
      // file URL일 경우, 브라우저 환경에서는 접근 불가하므로, 사용자에게 알림
      console.warn('Unsupported media type (file URL):', src);
      errors.push({ error: i18next.t('error:media.unsupportedSrcFormatError.statusText') + ": 'file://'", src });
      continue;
    } else {
      // 순수 파일명인 경우, localforage에서 base64로 변환 후, storeMediaFile로 요청, 존재하지 않은 경우 이미 요청한 경우일 수도 있으므로 무시
      if (tagName === 'img') {
        imageExtensions.forEach((ext) => {
          if (src.endsWith(`.${ext}`)) {
            // 이미지 파일명인 경우
            extension = ext;
            return;
          }
        });

        try {
          const file = await localforage.getItem<File>(src);
          if (!file) {
            errors.push({ error: i18next.t('error:media.mediaFileNotFound'), src });
            continue;  
          }
          params.data = await fileToBase64(file);
        } catch (err) {
          console.error('Failed to convert blob to base64:', err);
          errors.push({ error: i18next.t('error:media.base64Error.statusText'), src });
          continue;
        }
      } else if (tagName === 'video'||tagName === 'sound') {
        videoExtensions.forEach((ext) => {
          if (src.endsWith(`.${ext}`)) {
            // 비디오 파일명인 경우
            extension = ext;
            return;
          }
        });
        try {
          const file = await localforage.getItem<File>(src);
          if (!file) {
            errors.push({ error: i18next.t('error:media.mediaFileNotFound'), src });
            continue;  
          }
          params.data = await fileToBase64(file);
        } catch (err) {
          console.error('Failed to convert blob to base64:', err);
          errors.push({ error: i18next.t('error:media.base64Error.statusText'), src });
          continue;
        }
      } else if (tagName === 'audio') {
        audioExtensions.forEach((ext) => {
          if (src.endsWith(`.${ext}`)) {
            // 오디오 파일명인 경우
            extension = ext;
            return;
          }
        });
        try {
          const file = await localforage.getItem<File>(src);
          if (!file) {
            errors.push({ error: i18next.t('error:media.mediaFileNotFound'), src });
            continue;  
          }
          params.data = await fileToBase64(file);
        } catch (err) {
          console.error('Failed to convert blob to base64:', err);
        }
      }
    }

    // deleteExisting 옵션은 false로 고정, AnkiConnect에서 파일명 겹침 + 실제 파일 겹치면 알아서 존재하던 파일을 돌려줌
    // 따라서 의도적으로 파일명을 동일하게 지정하여 요청
    let filename;
    if (tagName === 'img') {
      filename = 'pasted_image.' + (extension || 'png');
    } else if (tagName === 'audio') {
      filename = 'pasted_audio.' + (extension || 'mp3');
    } else if (tagName === 'video'||tagName === 'sound') {
      filename = 'pasted_video.' + (extension || 'mp4');
    } else {
      console.warn('Unsupported media type:', element.tagName);
      errors.push({ error: i18next.t('error:media.unsupportedSrcFormatError.statusText'), src });
      continue;
    }
    params.filename = filename;

    const ankiStore = useAnkiConnectionStore.getState();
    console.log('storeMediaFile params:', params);
    let res = await ankiStore
      .fetchAnki<string>({
        action: 'storeMediaFile',
        params,
      })
      .then((res => {
        if (res.error === 'error') {
            console.error('Failed to store media file:', res.error);
            return { result: 'error', error: res.error };
        } else {
          //HTML 내의 src, [sound:파일명]을 AnkiConnect에서 반환된 파일명으로 치환
          if (tagName === 'img'||tagName ==='audio'||tagName === 'video') {
            element.node.setAttribute('src', res.result);
          } else if (tagName === 'sound') {
            // [sound:파일명] 치환
            const soundRegex = new RegExp(`\\[sound:${src}\\]`, 'g');
            doc.body.innerHTML = doc.body.innerHTML.replace(soundRegex, `[sound:${res.result}]`);
          } else {
            console.warn('Unsupported media type for replacement:', element.tagName);
            errors.push({ error: i18next.t('error:media.unsupportedSrcFormatError.statusText'), src });
          }
        }
        return res;
      }))
      .catch((err) => {
        console.error('Failed to store media file:', err);
        errors.push({ error: i18next.t('error:media.storeMediaError') + `: ${err}`, src });
      });
  }
  return { result: 'ok', errors, data: doc.body.innerHTML };
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
    // [Case 1] 순수 텍스트 조각인 경우
    if (typeof op.insert === 'string') {
      let text = op.insert;

      // 💥 [핵심 수정] Quill Delta의 가장 마지막 오퍼레이션의 맨 마지막 글자가 '\n'이라면,
      // 그것은 사용자가 입력한 엔터가 아니라 Quill의 구조적 마감 엔터입니다.
      // 따라서 사용자가 입력한 연속 엔터는 보존하고, 마지막 마감 엔터 1개만 싹 지워줍니다.
      const isLastOp = index === delta.ops.length - 1;
      if (isLastOp && text.endsWith('\n')) {
        text = text.slice(0, -1); // 맨 끝 \n 하나만 정확히 제거
      }

      // 남은 모든 \n은 사용자가 의도한 줄바꿈이므로 안전하게 <br>로 치환
      resultHtml += text.replace(/\n/g, '<br>');
      return;
    }

    // [Case 2] 임베드 객체 처리 (이전과 동일)
    if (op.insert && typeof op.insert === 'object') {
      if ('anki-image' in op.insert) {
        const imgData = op.insert['anki-image'] as { src?: string; mediaId?: string } | string;
        const mediaId = typeof imgData === 'object' ? imgData.mediaId : '';
        if (mediaId) resultHtml += `<img src="${mediaId}">`;
      } 
      else if ('anki-sound' in op.insert) {
        const mediaId = op.insert['anki-sound'] as string;
        if (mediaId) resultHtml += `[sound:${mediaId}]`;
      }
    }
  });

  // 💥 이전에 있던 위험한 전체 .replace(/(<br>)+$/, '') 구문은 완전히 제거했습니다.
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
