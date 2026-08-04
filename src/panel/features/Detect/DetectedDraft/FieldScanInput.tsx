import { FieldData } from "@/types/scanRule.types";
// TODO: separate FieldScanInput style && folder
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import { useTranslation } from "react-i18next";
import { convertQuillToAnkiPureHtml, onWebMediaDrop, restoreMediaPreviews } from "@/panel/utils/functions";
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
          src: node.getAttribute('src'),
          mediaId: node.getAttribute('data-file')
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
              // 이미지 (WebP 포함)
              'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif',
              // 오디오
              'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/flac', 'audio/mp4', 'audio/m4a',
              // 비디오
              'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'
            ],
            handler: async function(range: { index: number; }, files: File[]) {
              console.log("processing media file", files);
              
              // 수정한 부분: async/await가 루프 내에서 올바르게 작동하도록 for...of 사용
              let currentIndex = range.index;
            
              for (const file of files) {
                const ext = file.type.split('/')[1] || 'bin';
                const mediaId = `anki_media_${Date.now()}_${Math.random().toString(36).substring(2,5)}.${ext}`;
                
                // 1. localforage 저장 완료 대기
                await localforage.setItem(mediaId, file);
                console.log("local item 저장 완료:", mediaId);
            
                // 2. 임시 URL 생성
                const tempUrl = URL.createObjectURL(file);
                const finalSrc = `${tempUrl}?file=${mediaId}`;
            
                if (file.type.startsWith('image/')) {
                  // 3. 커스텀 Blot 덕분에 객체 형태로 주입 가능 (src 검증 우회 및 속성 동시 주입)
                  editorQuill.insertEmbed(currentIndex, 'image', {
                    src: finalSrc,
                    mediaId: mediaId
                  });
                  currentIndex += 1; // 이미지가 삽입된 만큼 인덱스 이동
                  
                } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                  editorQuill.insertText(currentIndex, `[sound:${finalSrc}]`);
                  currentIndex += `[sound:${finalSrc}]`.length;
                }
              }
            }
          }
        }
      }
    );
    // Web에서 파일을 끌어서 놓을 때 처리하는 이벤트 핸들러 등록
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
    
        const oldBlobUrls: string[] = [];
        oldDelta.ops.forEach(op => {
          if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
            oldBlobUrls.push((op.insert as { image: string }).image);
          }
        });
    
        const currentContents = editorQuill.getContents();
        const currentBlobUrls = new Set<string>();
        
        currentContents.ops.forEach(op => {
          if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
            currentBlobUrls.add((op.insert as { image: string }).image);
          }
        });
    
        oldBlobUrls.forEach(oldBlobUrl => {
          if (!currentBlobUrls.has(oldBlobUrl) && oldBlobUrl.startsWith('blob:')) {
            const match = oldBlobUrl.match(/file=(anki_media_[^&]+)/);
            if (match){
              const filename = match[1];
              localforage.removeItem(filename);
            }
          }
        });
      }
    });
    restoreMediaPreviews(editorQuill);
    editorQuill.root.addEventListener('dragover', onFieldDragOver);
    //editorQuill.root.addEventListener('drop', drop);
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur);
    return ()=>{
      editorQuill.off('text-change');
      editorQuill.root.removeEventListener('dragover', onFieldDragOver);
      //editorQuill.root.removeEventListener('drop', drop);
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