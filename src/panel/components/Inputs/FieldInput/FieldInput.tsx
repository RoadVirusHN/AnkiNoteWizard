import { FieldData } from "@/types/scanRule.types";
// TODO: separate FieldScanInput style && folder
import fieldInputStyles from "@/panel/components/Inputs/FieldInput/fieldInput.module.css";
import editorStyles from "@/panel/components/Editor/editor.module.css";
import { useTranslation } from "react-i18next";
import { addNewMediaTags, convertQuillToAnkiPureHtml, deleteAllMediaTags, getEditorQuill, onWebMediaDrop, removeDeletedMediaTags, restoreMediaPreviews } from "@/panel/utils/quillUtils";
import { DragEvent, forwardRef, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import Quill from "quill";
import 'quill/dist/quill.snow.css';
import EditorToolbar from "@/panel/components/Editor/EditorToolbar";
import Toolbar from "quill/modules/toolbar";

export interface FieldInputHandle {
  editorRef: React.RefObject<HTMLDivElement|null>;
  editorQuill: Quill | null;
  getContent(): string;
  reset(content: string): void;
  saved():void;
  deleted():void;
}

interface FieldInputProps {
  field:FieldData;
  editorToolbarRef?:RefObject<HTMLElement|null>;
  options?: {
    isEditing?: boolean;
    defaultFocus?: boolean;
    alwaysToolbar?: boolean;
  }
  onDirty: () => void;
}
//TODO : Better HTML Preview 
const FieldInput = forwardRef<FieldInputHandle, FieldInputProps>(({field, editorToolbarRef,options, onDirty},ref) => {
  const {isEditing, defaultFocus, alwaysToolbar} = {isEditing: options?.isEditing||false, defaultFocus: options?.defaultFocus||false, alwaysToolbar: options?.alwaysToolbar||false};
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  const containedTooManyEmpty = field.content.length - renderedContent.length > 30;
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  const individualToolbarRef = useRef<HTMLDivElement>(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const focus = () => setIsFocusing(true);
  const blur = () => setIsFocusing(false);

  const onFieldDragEnter = (e:DragEvent) => {
    e.preventDefault(); 
    setIsFocusing(true);
    editorRef.current?.classList.add(fieldInputStyles.dragOver);
  };
  const onFieldDragLeave = (e:DragEvent) => {
    e.preventDefault(); 
    if (fieldRef.current && !fieldRef.current.contains(e.relatedTarget as Node)) {
      setIsFocusing(false);
      editorRef.current?.classList.remove(fieldInputStyles.dragOver);
    }
  };
  const onFieldDragOver = (e:DragEvent) => {
    e.preventDefault(); 
  };
  const onFieldDragDrop= (e:DragEvent) => {
    e.preventDefault(); 
    editorRef.current?.classList.remove(fieldInputStyles.dragOver);
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
    const toolbarRef = editorToolbarRef || individualToolbarRef;
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
    editorQuill.on('selection-change', function(range){
      if (range){
        editorToolbarRef?.current?.classList.remove(editorStyles.deactive);
        const toolbarModule = editorQuill.getModule('toolbar') as Toolbar;
        toolbarModule.attach(editorQuill.root);
      } else {
        if (!document.activeElement?.closest('.ql-editor')) {
            editorToolbarRef?.current?.classList.add(editorStyles.deactive);
          }
      }
    });
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur);
    return ()=>{
      editorQuill.off('text-change');
      editorQuill.off('selection-change');
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);
  if (quillRef.current) restoreMediaPreviews(quillRef.current);
  if (isEditing && editorRef.current && defaultFocus) {
    editorRef.current.focus();
  }
  return <div className={fieldInputStyles.fieldInput} ref={fieldRef} onDragEnter={onFieldDragEnter} onDragLeave={onFieldDragLeave} onDragOver={onFieldDragOver} onDrop={onFieldDragDrop}>
       <label 
      className={`${fieldInputStyles.fieldLabel}` + (containedTooManyEmpty ? ` ${fieldInputStyles.veryEmpty}` : '')}
      htmlFor="content"
      title={containedTooManyEmpty ?t('containedTooManyEmptyWarn'):''}
      >{field.key}</label>
      <div className={fieldInputStyles.fields}>
        <div className={fieldInputStyles.field} onClick={(e)=>{e.stopPropagation();}} style={ {margin: 'auto', width: '100%'}} >
          {editorToolbarRef===undefined&&<EditorToolbar toolbarRef={individualToolbarRef} show={alwaysToolbar||(isFocusing&&isEditing)} />}
          <div
            id='content'
            ref={editorRef}
            className={fieldInputStyles.editor}/>
        </div>
      </div>
    </div>;
});
export default FieldInput;