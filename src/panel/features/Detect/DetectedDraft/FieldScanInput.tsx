import { FieldData } from "@/types/scanRule.types";
// TODO: separate FieldScanInput style && folder
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import { useTranslation } from "react-i18next";
import { convertQuillToAnkiPureHtml, onWebMediaDrop, restoreMediaPreviews } from "@/panel/utils/quillUtils";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Quill from "quill";
import 'quill/dist/quill.snow.css';
import EditorToolbar from "@/panel/components/Editor/EditorToolbar";
import localforage from "localforage";
const MAX_CONTENT_LENGTH = 100;

export interface FieldScanInputHandle {
    getContent(): string;
    reset(content: string): void;
    saved():void;
}

interface FieldScanInputProps {
  field:FieldData;
  isEditing: boolean;
  defaultFocus: boolean;
  onDirty: () => void;
}
//TODO : Better HTML Preview 
const FieldScanInput = forwardRef<FieldScanInputHandle, FieldScanInputProps>(({field, isEditing, defaultFocus, onDirty},ref) => {
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  const containedTooManyEmpty = field.content.length - renderedContent.length > 30;
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>(null);
  const editorToolbarRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const [isFocusing, setIsFocusing] = useState(false);
  const focus = () => setIsFocusing(true);
  const blur = () => setIsFocusing(false);

  const dirtyRef = useRef(false);
  useImperativeHandle(ref, () => ({
      getContent() {
          return convertQuillToAnkiPureHtml(quillRef.current!.root.innerHTML);
      },

      reset(content: string) {
        dirtyRef.current = false;

        const editor = quillRef.current;
        if (!editor) return;
        const range = editor.getSelection();

        editor.clipboard.dangerouslyPasteHTML(content);

        if (range) {// 이거 안하면 quill.js가 멋대로 렌더링하면서 focus를 뺏어감.
            editor.setSelection(range);
        } else {
            editor.blur();
        }
      },
      saved(){
        dirtyRef.current=false;
      }
  }));
  const onFieldDragOver = (e: DragEvent) => {
    e.preventDefault(); 
  };
  useEffect(()=>{
    if (!editorRef.current||!editorToolbarRef.current) return;
    if (!isMounted.current) {
      // prevent double toolbar by strict mode
      isMounted.current = true;
      return;
    }

    const Embed = Quill.import('blots/embed') as any;

    class AnkiSoundBlot extends Embed {
      static create(value: { mediaId: string; src?: string } | string) {
        const node = super.create();
        
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
          src: node.getAttribute('data-src') || ''
        };
      }
    }

    // 중요: 델타가 'anki-sound' 키를 바인딩하도록 설정
    AnkiSoundBlot.blotName = 'anki-sound';
    AnkiSoundBlot.tagName = 'SPAN'; 
    Quill.register(AnkiSoundBlot, true);

    const ImageBlot = Quill.import('formats/image') as any;

    class AnkiImageBlot extends ImageBlot {
      static create(value: { src: string; mediaId: string } | string) {
        const node = super.create(typeof value === 'string' ? value : value.src);
        
        if (typeof value === 'object') {
          node.setAttribute('src', value.src);
          node.setAttribute('data-file', value.mediaId);
        }
        return node;
      }

      static value(node: HTMLElement) {
        return {
          src: node.getAttribute('src')||'',
          mediaId: node.getAttribute('data-file')||''
        };
      }
    }

    // 오버라이딩 등록
    AnkiImageBlot.blotName = 'image';
    AnkiImageBlot.tagName = 'IMG';
    Quill.register(AnkiImageBlot, true);
    //TODO : 버그 : blob url이 제대로 생성이 안됨, 인터넷 파일의 경우 그냥 blob url 말고 원본 url 쓰기
    // TODO: 이미지 클릭시 스타일 변경 기능 구현.
    const editorQuill = new Quill(editorRef.current,
      {
        debug: 'warn',
        theme: 'snow',
        modules: {
          toolbar: editorToolbarRef.current,
          uploader: {
            mimetypes: [
              // 이미지
              'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif',
              // 오디오
              'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/flac', 'audio/mp4', 'audio/m4a',
              // 비디오
              'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'
            ],
            handler: async function(range: { index: number; }, files: File[]) {
              let currentIndex = range.index;
            
              for (const file of files) {
                const ext = file.type.split('/')[1] || 'bin';
                const mediaId = `anki_media_${Date.now()}_${Math.random().toString(36).substring(2,5)}.${ext}`;
                await localforage.setItem(mediaId, file);
                
                const tempUrl = URL.createObjectURL(file);
            
                if (file.type.startsWith('image/')) {
                  editorQuill.insertEmbed(currentIndex, 'image', {
                    src: tempUrl,
                    mediaId: mediaId
                  });
                  currentIndex += 1; 
                  
                } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                  // 사운드도 임베드 데이터 형식으로 삽입
                  editorQuill.insertEmbed(currentIndex, 'anki-sound', {
                    mediaId: mediaId,
                    src: tempUrl // 현재 켜져 있는 창에서 바로 들을 수 있도록 매핑
                  });
                  currentIndex += 1;

                }
              }
            }
          }
        }
      }
    );

    const drop = onWebMediaDrop(editorQuill);
    editorQuill.clipboard.dangerouslyPasteHTML(field.content);
    quillRef.current = editorQuill;
    editorQuill.on('text-change', function(delta, oldDelta, source) {
      if (source === 'user') {
        console.log("source changed by user");
        if (!dirtyRef.current) {
          dirtyRef.current = true;
          onDirty();
        }
        
        //TODO : video, audio 삭제시 로직도 완성하기
        const oldMediaIds: string[] = [];
        oldDelta.ops.forEach(op => {
          if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
            const imgData = op.insert.image as { src?: string; mediaId?: string } | string;
            if (typeof imgData === 'object' && imgData.mediaId) {
              oldMediaIds.push(imgData.mediaId);
            }
          }
        });
    
        const currentContents = editorQuill.getContents();
        const currentMediaIds = new Set<string>();
        
        currentContents.ops.forEach(op => {
          if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
            const imgData = op.insert.image as { src?: string; mediaId?: string } | string;
            if (typeof imgData === 'object' && imgData.mediaId) {
              currentMediaIds.add(imgData.mediaId);
            }
          }
        });
    
        oldMediaIds.forEach(oldId => {
          if (!currentMediaIds.has(oldId)) {
            localforage.removeItem(oldId).then(() => {
              console.log(`DB 미디어 자원 삭제: ${oldId}`);
            }).catch(err => {
              console.error("DB 자원 삭제 실패:", err);
            });
          }
        });
      }
    });
  
    restoreMediaPreviews(editorQuill);
    editorQuill.root.addEventListener('dragover', onFieldDragOver);
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur);
    return ()=>{
      editorQuill.off('text-change');
      editorQuill.root.removeEventListener('dragover', onFieldDragOver);
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);
  if (isEditing && editorRef.current && defaultFocus) {
    editorRef.current.focus();
  }
  return <div className={detectedDraftStyles.fieldInput}>
       <label 
      className={`${detectedDraftStyles.fieldLabel}` + (containedTooManyEmpty ? ` ${detectedDraftStyles.veryEmpty}` : '')}
      htmlFor="content"
      title={containedTooManyEmpty ?t('containedTooManyEmptyWarn'):''}
      >{field.key}</label>
      <div className={detectedDraftStyles.fields}>
        <div className={detectedDraftStyles.field} onClick={(e)=>{e.stopPropagation();}} style={ {margin: 'auto', width: '100%'}} >
          <EditorToolbar toolbarRef={editorToolbarRef} isFocusing={isFocusing&&isEditing} />
          <div
            id='content'
            ref={editorRef}
            style={{border: "1px solid var(--color-primary)", width: '100%'}}/> 
        </div>
      </div>
    </div>;
});
export default FieldScanInput;