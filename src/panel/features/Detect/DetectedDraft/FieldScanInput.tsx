import { FieldData } from "@/types/scanRule.types";
// TODO: separate FieldScanInput style && folder
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import { useTranslation } from "react-i18next";
import { convertQuillToAnkiPureHtml, deleteAllMediaTags, getEditorQuill, onWebMediaDrop, removeDeletedMediaTags, restoreMediaPreviews } from "@/panel/utils/quillUtils";
import { DragEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Quill from "quill";
import 'quill/dist/quill.snow.css';
import EditorToolbar from "@/panel/components/Editor/EditorToolbar";

export interface FieldScanInputHandle {
    getContent(): string;
    reset(content: string): void;
    saved():void;
    deleted():void;
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
  const fieldRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const [isFocusing, setIsFocusing] = useState(false);
  const focus = () => setIsFocusing(true);
  const blur = () => setIsFocusing(false);

  const onFieldDragEnter = (e:DragEvent) => {
    e.preventDefault(); 
    setIsFocusing(true);
    editorRef.current?.classList.add(detectedDraftStyles.dragOver);
  };
  const onFieldDragLeave = (e:DragEvent) => {
    e.preventDefault(); 
    if (fieldRef.current && !fieldRef.current.contains(e.relatedTarget as Node)) {
      setIsFocusing(false);
      editorRef.current?.classList.remove(detectedDraftStyles.dragOver);
    }
  };
  const onFieldDragOver = (e:DragEvent) => {
    e.preventDefault(); 
  };
  const onFieldDragDrop= (e:DragEvent) => {
    e.preventDefault(); 
    editorRef.current?.classList.remove(detectedDraftStyles.dragOver);
  };
  const makeDirty = ()=>{
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirty();
    }        
  }
  //TODO: Ctrl + Z 시 이상현상
  const dirtyRef = useRef(false);
  useImperativeHandle(ref, () => ({
      getContent() {
          if (!quillRef.current) return "";
          return convertQuillToAnkiPureHtml(quillRef.current);
      },

      reset(content: string) {
        dirtyRef.current = false;

        const editor = quillRef.current;
        if (!editor) return;
        const range = editor.getSelection();
        
        editor.clipboard.dangerouslyPasteHTML(content);
        
        if (editor.history) {
          // reset history(Ctrl+z) to prevent deleting the previous content.
          editor.history.clear();
        }

        if (range) {// 이거 안하면 quill.js가 멋대로 렌더링할 때마다 focus를 뺏어감.
            editor.setSelection(range);
        } else {
            editor.blur();
        }
      },
      saved(){
        dirtyRef.current=false;
        const editorQuill = quillRef.current;
        if (editorQuill) {
          const oldDelta = editorQuill.clipboard.convert({html: field.content});
          removeDeletedMediaTags(editorQuill, oldDelta);
        }
      },
      deleted(){
        dirtyRef.current=false;
        const editorQuill = quillRef.current;
        if (editorQuill) {
          deleteAllMediaTags(editorQuill);
        }
      }
  }));

  useEffect(()=>{
    if (!editorRef.current||!editorToolbarRef.current) return;
    if (!isMounted.current) {
      // prevent double toolbar by strict mode
      isMounted.current = true;
      return;
    }

    const editorQuill = getEditorQuill(editorRef.current, editorToolbarRef.current, makeDirty);
    editorQuill.clipboard.dangerouslyPasteHTML(field.content);
    if (editorQuill.history) {
      // reset history(Ctrl+z) to prevent deleting the previous content.
      editorQuill.history.clear();
    }
    quillRef.current = editorQuill;
    editorQuill.on('text-change', function(delta, oldDelta, source) {
      if (source === 'user') {
        makeDirty();
      }
    });
  
    restoreMediaPreviews(editorQuill);
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur);
    return ()=>{
      editorQuill.off('text-change');
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);
  if (isEditing && editorRef.current && defaultFocus) {
    editorRef.current.focus();
  }
  return <div className={detectedDraftStyles.fieldInput} ref={fieldRef} onDragEnter={onFieldDragEnter} onDragLeave={onFieldDragLeave} onDragOver={onFieldDragOver} onDrop={onFieldDragDrop}>
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
            className={detectedDraftStyles.editor}/>
        </div>
      </div>
    </div>;
});
export default FieldScanInput;