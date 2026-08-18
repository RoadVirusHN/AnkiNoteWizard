import useInspection from "@/panel/hooks/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import { FieldData } from "@/types/scanRule.types";
import { useTranslation } from "react-i18next";
import { convertQuillToAnkiPureHtml, getEditorQuill, onWebMediaDrop, removeDeletedMediaTags, restoreMediaPreviews } from "@/panel/utils/quillUtils";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
  const makeDirty = ()=>{
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirty();
    }        
  };
  useImperativeHandle(ref, () => ({
      getContent() {
        if (quillRef.current === null)  return "";
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

        if (range) { // 이거 안하면 quill.js가 멋대로 렌더링하면서 focus를 뺏어감.
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
    editorQuill.clipboard.dangerouslyPasteHTML(content);
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
    editorQuill.root.addEventListener('blur', blur)
    return ()=>{
      editorQuill.off('text-change');  
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