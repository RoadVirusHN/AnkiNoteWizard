import { DragEvent, forwardRef, RefObject, useEffect, useImperativeHandle, useRef, useState } from 'react';
import sharedToolbarEditorStyles from './sharedToolbarEditor.module.css';
import { FieldData } from '@/types/scanRule.types';
import Quill from 'quill';
import { useTranslation } from 'react-i18next';
import { addNewMediaTags, convertQuillToAnkiPureHtml, deleteAllMediaTags, getEditorQuill, removeDeletedMediaTags, restoreMediaPreviews } from '@/panel/utils/quillUtils';
import EditorToolbar from '../../Editor/EditorToolbar';
export interface RefAttributes {
  editorRef: React.RefObject<HTMLDivElement|null>;
  editorQuill: Quill | null;
  getContent(): string;
  reset(content: string): void;
  saved():void;
  deleted():void;
}

interface Props {
  field:FieldData;
  editorToolbarRef?:RefObject<HTMLElement|null>;
  options?: {
    isEditing?: boolean;
    defaultFocus?: boolean;
    alwaysToolbar?: boolean;
  }
  onDirty: () => void;
}

const SharedToolbarEditor = forwardRef<RefAttributes, Props>(({field, editorToolbarRef,options, onDirty},ref) => {
  const {isEditing, defaultFocus, alwaysToolbar} = {isEditing: options?.isEditing||false, defaultFocus: options?.defaultFocus||false, alwaysToolbar: options?.alwaysToolbar||false};
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  const containedTooManyEmpty = field.content.length - renderedContent.length > 30;
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  const attachedToolbarRef = useRef<HTMLDivElement>(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const focus = () => setIsFocusing(true);
  const blur = () => setIsFocusing(false);

  const onFieldDragEnter = (e:DragEvent) => {
    e.preventDefault(); 
    setIsFocusing(true);
    editorRef.current?.classList.add(sharedToolbarEditorStyles.dragOver);
  };
  const onFieldDragLeave = (e:DragEvent) => {
    e.preventDefault(); 
    if (fieldRef.current && !fieldRef.current.contains(e.relatedTarget as Node)) {
      setIsFocusing(false);
      editorRef.current?.classList.remove(sharedToolbarEditorStyles.dragOver);
    }
  };
  const onFieldDragOver = (e:DragEvent) => {
    e.preventDefault(); 
  };
  const onFieldDragDrop= (e:DragEvent) => {
    e.preventDefault(); 
    editorRef.current?.classList.remove(sharedToolbarEditorStyles.dragOver);
  };
  const makeDirty = ()=>{
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirty();
    }        
  }
  const dirtyRef = useRef(false);
  useImperativeHandle(ref, () => ({
    editorRef: editorRef,
    editorQuill: quillRef.current,
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
          addNewMediaTags(editorQuill);
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
    const toolbarRef = editorToolbarRef || attachedToolbarRef;
    if (!editorRef.current||!toolbarRef.current) return;
    if (!isMounted.current) {
      // prevent double toolbar by strict mode
      isMounted.current = true;
      return;
    }

    const editorQuill = getEditorQuill(editorRef.current, toolbarRef.current, makeDirty);
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
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur);
    return ()=>{
      editorQuill.off('text-change');
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);
  if (quillRef.current) restoreMediaPreviews(quillRef.current);
  if (isEditing && editorRef.current && defaultFocus) {
    editorRef.current.focus();
  }
return <div className={sharedToolbarEditorStyles.fieldInput} ref={fieldRef} onDragEnter={onFieldDragEnter} onDragLeave={onFieldDragLeave} onDragOver={onFieldDragOver} onDrop={onFieldDragDrop}>
  <label 
 className={`${sharedToolbarEditorStyles.fieldLabel}` + (containedTooManyEmpty ? ` ${sharedToolbarEditorStyles.veryEmpty}` : '')}
 htmlFor="content"
 title={containedTooManyEmpty ?t('containedTooManyEmptyWarn'):''}
 >{field.key}</label>
 <div className={sharedToolbarEditorStyles.fields}>
   <div className={sharedToolbarEditorStyles.field} onClick={(e)=>{e.stopPropagation();}} style={ {margin: 'auto', width: '100%'}} >
     {editorToolbarRef===undefined&&<EditorToolbar toolbarRef={attachedToolbarRef} show={alwaysToolbar||(isFocusing&&isEditing)} />}
     <div
       id='content'
       ref={editorRef}
       className={sharedToolbarEditorStyles.editor}/>
   </div>
 </div>
</div>;
});
export default SharedToolbarEditor;