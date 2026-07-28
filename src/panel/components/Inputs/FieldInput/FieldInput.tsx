import useInspection from "@/panel/hooks/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import { FieldData } from "@/types/scanRule.types";
import { useTranslation } from "react-i18next";
import { convertQuillToAnkiPureHtml, onWebMediaDrop, restoreMediaPreviews } from "@/panel/utils/functions";
import { ChangeEventHandler, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import fieldInputStyle from "./fieldInput.module.css";
import Quill from "quill";
import 'quill/dist/quill.snow.css';
import EditorToolbar from "../../Editor/EditorToolbar";
import localforage from "localforage";
export interface FieldInputHandle {
    getContent(): string;
    reset(content: string): void;
    saved():void;
}

type Props = {
    field: FieldData;
    onDirty: () => void;
};

const FieldInput = forwardRef<FieldInputHandle, Props>(({ field, onDirty }, ref) => {
  //TODO: Implement FieldInput component
  /*
    Features to implement:
    1. HTML Code Editor for inputting field content
    ~~2. onDrag & onPaste handlers to support media file input (images, audio, video)~~
    3. (Later) Simple Preview of the content being inputted (rendering HTML tags for media) with expand/collapse functionality.
    4. (Later) Anki template variables support (e.g., {{FieldName}}) with auto-suggestions based on the current note type's fields
  */
  const {enterInspectionMode} = useInspection();
  const {t} = useTranslation('components',{keyPrefix: 'fieldInput'});
  const {key, content} = field;

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>(null);
  const editorToolbarRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  
  const [isFocusing, setIsFocusing] = useState(false);
  const focus = () => setIsFocusing(true);
  const blur = () => setIsFocusing(false);

  //TODO: 요부분 훅으로 빼서 공통 코드로
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

        if (range) { // 이거 안하면 quill.js가 멋대로 렌더링하면서 focus를 뺏어감.
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
    const editorQuill = new Quill(editorRef.current,
      {
        debug: 'warn',
        theme: 'snow',
        modules: {
          toolbar: editorToolbarRef.current,
          uploader: {
            mimetypes: ['image/*','audio/*','video/*'],
            handler: async function(range: { index: number; }, files: File[]) {
              files.forEach(async (file: File) => {
                const ext = file.type.split('/')[1] || 'bin';
                const mediaId = `anki_media_${Date.now()}_${Math.random().toString(36).substring(2,5)}.${ext}`;
                await localforage.setItem(mediaId, file);              
                const tempUrl = URL.createObjectURL(file);
                if (file.type.startsWith('image/')) {
                  editorQuill.insertEmbed(range.index, 'image', mediaId);
                  
                  const imgEl = editorRef.current?.querySelector(`img[src="${mediaId}"]`) as HTMLImageElement;
                  if (imgEl) {
                    imgEl.src = tempUrl + '?file=' + mediaId;
                  }
                } 
                else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                  //TODO: video 어케 보여주지??
                  editorQuill.insertText(range.index, `[sound:${tempUrl}?file=${mediaId}]`);
                }
              });
            }
          }
        }
      }
    );
    const drop = onWebMediaDrop(editorQuill);
    editorQuill.clipboard.dangerouslyPasteHTML(content);
    quillRef.current = editorQuill;
    editorQuill.on('text-change', function(delta, oldDelta, source) {
      if (source === 'user') {
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
    editorQuill.root.addEventListener('drop', drop);
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur)
    return ()=>{
      editorQuill.off('text-change');  
      editorQuill.root.removeEventListener('dragover', onFieldDragOver);
      editorQuill.root.removeEventListener('drop', drop);
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);

  return <div className={fieldInputStyle.container}>
    <div className={fieldInputStyle.header}>
      <label htmlFor={key} className={fieldInputStyle.fieldName}>{key}</label>
      <img style={{cursor: 'pointer'}} title="Extract Data" src={MagicIcon} onClick={()=>{enterInspectionMode();}}/> 
    </div>
      
    <div onClick={(e)=>{e.stopPropagation();}} style={ {margin: 'auto', width: '100%'}} >
      <EditorToolbar toolbarRef={editorToolbarRef} isFocusing={isFocusing} />
      <div
        id='content'
        ref={editorRef}
        style={{border: "1px solid var(--color-primary)", width: '100%'}}
        />
    </div>
  </div>;
});
export default FieldInput;