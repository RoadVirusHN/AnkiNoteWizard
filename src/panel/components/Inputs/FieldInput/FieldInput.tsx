import { addNewMediaTags, convertQuillToAnkiPureHtml, deleteAllMediaTags, getEditorQuill, removeDeletedMediaTags, restoreMediaPreviews } from "@/panel/utils/quillUtils";
import { FieldData } from "@/types/scanRule.types";
import Quill from "quill";
import { RefObject, useEffect, useRef, useState, DragEvent, useImperativeHandle, forwardRef } from "react";
import fieldInputStyles from "@/panel/components/Inputs/FieldInput/fieldInput.module.css";

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
  toolbarRef:RefObject<HTMLElement|null>;
  isEditing: boolean;
  onDirty: () => void;
}


const FieldInput = forwardRef<FieldInputHandle,FieldInputProps>(({field,toolbarRef,isEditing,onDirty}, ref) => {
  const dirtyRef = useRef(false);
  const makeDirty = ()=>{
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirty();
    }        
  }
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
    if (editorRef.current && !editorRef.current.contains(e.relatedTarget as Node)) {
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
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>(null);
  useEffect(()=>{
    if (!editorRef.current||!toolbarRef.current) return;

    const editorQuill = getEditorQuill(editorRef.current, toolbarRef.current, makeDirty);
    editorQuill.clipboard.dangerouslyPasteHTML(field.content);
    if (editorQuill.history) {
      // reset history(Ctrl+z) to prevent deleting the previous content.
      editorQuill.history.clear();
    }
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

  if (quillRef.current) restoreMediaPreviews(quillRef.current);
  return <div
    ref={editorRef}
    className={fieldInputStyles.editor}
    onDragEnter={onFieldDragEnter} 
    onDragLeave={onFieldDragLeave}
    onDragOver={onFieldDragOver} 
    onDrop={onFieldDragDrop}
  />;
});
export default FieldInput;