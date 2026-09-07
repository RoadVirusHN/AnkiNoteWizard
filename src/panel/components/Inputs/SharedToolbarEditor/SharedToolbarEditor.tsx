import { DragEvent, forwardRef, RefObject, useEffect, useImperativeHandle, useRef, useState } from 'react';
import sharedToolbarEditorStyles from './sharedToolbarEditor.module.css';
import { FieldData } from '@/types/scanRule.types';
import Quill from 'quill';
import { useTranslation } from 'react-i18next';
import { addNewMediaTags, convertQuillToAnkiPureHtml, deleteAllMediaTags, getEditorQuill, removeDeletedMediaTags, restoreMediaPreviews } from '@/panel/utils/quillUtils';
import EditorToolbar from '../../Editor/EditorToolbar';
export interface SharedToolbarEditorRefAttributes {
  editorRef: React.RefObject<HTMLDivElement|null>;
  editorQuill: Quill | null;
  getContent(): string;
  reset(content: string): void;
  saved():void;
  deleted():void;
  focus():void;
  blur():void;
}

interface Props {
  field:FieldData;
  toolbarQuill: Quill;
  isEditing: boolean;
  onDirty: () => void;
  moveFocus: () => void;
}

const SharedToolbarEditor = forwardRef<SharedToolbarEditorRefAttributes, Props>(({field, toolbarQuill, isEditing, onDirty},ref) => {
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  const toolbarEditor = toolbarQuill.root;
  const readonlyEditorRef = useRef<HTMLDivElement>(null);
  const readonlyQuillRef = useRef<Quill>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const focus = () => {
    if (isEditing) {
      setIsFocusing(true)
    }
  };
  const blur = () => setIsFocusing(false);

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
        if (!readonlyQuillRef.current) return "";
        return convertQuillToAnkiPureHtml(readonlyQuillRef.current);
    },

    reset(content: string) {
      dirtyRef.current = false;

      const editor = readonlyQuillRef.current;
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
      const editorQuill = readonlyQuillRef.current;
      if (editorQuill) {
        const oldDelta = editorQuill.clipboard.convert({html: field.content});  
        addNewMediaTags(editorQuill);
        removeDeletedMediaTags(editorQuill, oldDelta);
      }
    },
    deleted(){
      dirtyRef.current=false;
      const editorQuill = readonlyQuillRef.current;
      if (editorQuill) {
        deleteAllMediaTags(editorQuill);
      }
    },
    focus(){
      // 1. readonlyEditor 내용을 toolbarEditor에 복사
      // 2. readonlyEditor display none
      // 3. toolbarEditor display block
    },
    blur(){
      // 1. toolbarEditor 내용을 readonlyEditor에 복사
      // 2. readonlyEditor display block
      // 3. toolbarEditor display none
    }
  }));
  useEffect(()=>{
    if (isFocusing) {
      containerRef.current?.appendChild(toolbarEditor);
      readonlyEditorRef.current?.classList.add(sharedToolbarEditorStyles.hide);
      toolbarQuill.clipboard.dangerouslyPasteHTML(field.content);
      if (toolbarQuill.history) {
        toolbarQuill.history.clear();
      }
      editorRef.current = toolbarEditor;
      quillRef.current = toolbarQuill;
    } else {

      editorRef.current = readonlyEditorRef.current;
      quillRef.current = readonlyQuillRef.current;
    }
  },[isFocusing, toolbarQuill, field.content]);

  useEffect(()=>{
    if (!readonlyEditorRef.current) return;
    const editorQuill = new Quill(readonlyEditorRef.current, {
      debug: 'warn',
      theme: 'snow',
      readOnly: true,
    });
    editorQuill.clipboard.dangerouslyPasteHTML(field.content);
    if (editorQuill.history) {
      // reset history(Ctrl+z) to prevent deleting the previous content.
      editorQuill.history.clear();
    }
    readonlyQuillRef.current = editorQuill;
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur);
    return ()=>{
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);
  if (quillRef.current) restoreMediaPreviews(quillRef.current);
return <div className={sharedToolbarEditorStyles.fieldInput}>
  <label 
  className={sharedToolbarEditorStyles.fieldLabel}
  htmlFor="content"
  >{field.key}</label>
  <div className={sharedToolbarEditorStyles.fields}>
    <div className={sharedToolbarEditorStyles.field} onClick={(e)=>{e.stopPropagation();}} style={ {margin: 'auto', width: '100%'}} ref={containerRef}>
        <div
        id='content'
        ref={readonlyEditorRef}
        className={sharedToolbarEditorStyles.editor}/>
      </div>
  </div>
</div>;
});
export default SharedToolbarEditor;