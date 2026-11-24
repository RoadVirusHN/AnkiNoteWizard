import { addNewMediaTags, convertQuillToAnkiPureHtml, deleteAllMediaTags, getEditorQuill, removeDeletedMediaTags, restoreMediaPreviews } from "@/panel/utils/quillUtils";
import { FieldData } from "@/types/scanRule.types";
import Quill from "quill";
import { RefObject, useEffect, useRef, useState, DragEvent, useImperativeHandle, forwardRef } from "react";
import fieldInputStyles from "@/panel/components/Inputs/FieldInput/fieldInput.module.css";
import 'quill/dist/quill.snow.css';
import Icon from "../../Icon/Icon";
import CollapseIcon from "@/public/Icon/Icon-Down.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import PinIcon from "@/public/Icon/Icon-Pin.svg";
import { useTranslation } from "react-i18next";
import { html } from "webpack";
import { Delta, EmitterSource } from "quill/core";

export interface FieldInputHandle {
  editorRef: React.RefObject<HTMLDivElement|null>;
  getContent(): string;
  reset(content: string): void;
  saved():void;
  deleted():void;
}

interface FieldInputProps {
  field:FieldData;
  toolbarRef:RefObject<HTMLElement|null>;
  onDirty: () => void;
  changeFocus: ()=>void;
}

const FieldInput = forwardRef<FieldInputHandle,FieldInputProps>(({field,toolbarRef,onDirty,changeFocus}, ref) => {
  const {t} = useTranslation("components",{keyPrefix:"fieldInput"});
  const dirtyRef = useRef(false);
  const makeDirty = ()=>{
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirty();
    }        
  }
  const isFocusingRef = useRef(false);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  const focus = () => {
    isFocusingRef.current = true;
    changeFocus();
  };
  const blur = () => isFocusingRef.current = false;

  const onFieldDragEnter = (e:DragEvent) => {
    e.preventDefault(); 
    focus();
    editorRef.current?.classList.add(fieldInputStyles.dragOver);
  };
  const onFieldDragLeave = (e:DragEvent) => {
    e.preventDefault(); 
    if (editorRef.current && !editorRef.current.contains(e.relatedTarget as Node)) {
      blur();
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
    if (htmlRef.current){
      htmlRef.current.value = convertQuillToAnkiPureHtml(editorQuill);
    }
    if (editorQuill.history) {
      // reset history(Ctrl+z) to prevent deleting the previous content.
      editorQuill.history.clear();
    }

    const handleTextChange = (delta:Delta, oldDelta:Delta, source:EmitterSource) => {
      if (source === 'user') {
        makeDirty();
        if (htmlRef.current&&!htmlRef.current.classList.contains(fieldInputStyles.off)) {
          htmlRef.current.value = convertQuillToAnkiPureHtml(editorQuill);
        }
      }
    }
    editorQuill.on('text-change',handleTextChange);
    const handleSelectionChange = (range:Delta, oldRange:Delta, source:EmitterSource) => { 
      if (range && source === 'user') {
        focus();
      }  else {
        blur();
      }
    }
    editorQuill.on('selection-change', handleSelectionChange);
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur);
    quillRef.current = editorQuill;

    restoreMediaPreviews(quillRef.current);
    if (isFocusingRef.current) {
      changeFocus();
    }
    return ()=>{
      editorQuill.off('text-change', handleTextChange);
      editorQuill.off('selection-change', handleSelectionChange);
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);

  // TODO: onDirty, changeFocus 함수를 callback으로 ref 관리?
  useImperativeHandle(ref, () => ({
    editorRef,
    getContent() {
      const editor = quillRef.current;
      if (!editor) return "";
      return convertQuillToAnkiPureHtml(editor);
    },
    reset(content: string) {
      dirtyRef.current = false;
      const editor = quillRef.current;
      if (!editor) return;
      const range = editor.getSelection();
      
      editor.clipboard.dangerouslyPasteHTML(content);
      if (htmlRef.current) {
        htmlRef.current.value = convertQuillToAnkiPureHtml(editor);
        htmlRef.current.classList.add(fieldInputStyles.off);
      }
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
      const editor = quillRef.current;
      if (editor) {
        deleteAllMediaTags(editor);
      }
    }
  }));

  // TODO : toggle sticky?
  return <>
    <div className={fieldInputStyles.fieldHeader}>
      <div>        
        <Icon url={CollapseIcon} className={`${fieldInputStyles.expandToggle} ${fieldInputStyles.button} ${fieldInputStyles.off}`}
        title={t("collapseExpandField")}
        onClick={(e)=>{
          e.currentTarget.classList.toggle(fieldInputStyles.off);
          
          editorRef.current?.style.setProperty('display', editorRef.current?.style.display === 'none' ? 'block' : 'none' );
          htmlRef.current?.style.setProperty('display', htmlRef.current?.style.display === 'none' ? 'block' : 'none' );
          quillRef.current?.blur();
        }}/>
        <div className={fieldInputStyles.fieldLabel}>{field.key}</div>
      </div>
      <div>
        <Icon url={CodeIcon} className={`${fieldInputStyles.codeToggle} ${fieldInputStyles.button} ${fieldInputStyles.off}`}
        title={t("toggleHTMLEditor")}
        onClick={(e)=>{
          const classList = e.currentTarget.classList;
          if (classList.contains(fieldInputStyles.off)) {
            classList.remove(fieldInputStyles.off);
            if (htmlRef.current) {
              htmlRef.current.classList.remove(fieldInputStyles.off);
              console.log("html editor on : origin: ",quillRef.current!);
              console.log("html editor on : html : ",convertQuillToAnkiPureHtml(quillRef.current!));

              htmlRef.current.value = convertQuillToAnkiPureHtml(quillRef.current!);
              console.log("html editor content updated:", htmlRef.current.value, quillRef.current!.root.innerHTML);
            }
          } else {
            classList.add(fieldInputStyles.off);
            htmlRef.current?.classList.add(fieldInputStyles.off);
          }
        }}
        onMouseEnter={(e)=>{
          console.log("Mouse enter code toggle");
        }}
        />
        {/* <Icon url={PinIcon} className={`${fieldInputStyles.pinToggle} ${fieldInputStyles.button} ${fieldInputStyles.off}`}  
          title={t("toggleSticky") + " Comming Soon!"}
          style={{cursor: 'not-allowed', backgroundColor: 'salmon'}}
          onClick={(e)=>{
            const classList = e.currentTarget.classList;
            if (classList.contains(fieldInputStyles.off)) {
              classList.remove(fieldInputStyles.off);

            } else {
              classList.add(fieldInputStyles.off);
            }
          }}
          onMouseEnter={(e)=>{
            console.log("Mouse enter code toggle");
        }}/> */}
      </div>
    </div>
    <div 
    ref={editorRef}
    className={fieldInputStyles.editor}
    onDragEnter={onFieldDragEnter} 
    onDragLeave={onFieldDragLeave}
    onDragOver={onFieldDragOver} 
    onDrop={onFieldDragDrop}
    />
    <textarea
      ref={htmlRef}
      id={field.key + "-html-editor"}
      className={`${fieldInputStyles.htmlEditor} ${fieldInputStyles.off}`}
      readOnly
      style={{width: 'calc(100% - 4px)', minHeight: '2rem', fieldSizing: 'content', resize: 'none', overflow: 'hidden'}} 
    />
  </>;
});
export default FieldInput;