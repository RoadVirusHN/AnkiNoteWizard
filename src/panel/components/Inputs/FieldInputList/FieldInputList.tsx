import { useTranslation } from "react-i18next";
import fieldInputListStyles from "./fieldInputList.module.css";
import EditorToolbar from "../../Editor/EditorToolbar";
import { useEffect, useRef } from "react";
import { FieldData } from "@/types/scanRule.types";
import FieldInput, { FieldInputHandle } from "../FieldInput/FieldInput";
import SharedToolbarEditor, { SharedToolbarEditorRefAttributes } from "../SharedToolbarEditor/SharedToolbarEditor";
import Quill from "quill";
import { getEditorQuill } from "@/panel/utils/quillUtils";


interface Props {
  fields: FieldData[];
  onDirty: () => void;
}

const FieldInputList = ({fields, onDirty}:Props) => {
  const {t:tCommon} = useTranslation('common');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarEditorRef = useRef<HTMLDivElement>(null);
  const toolbarEditorQuillRef = useRef<Quill>(null);
  const editorRefs = useRef<SharedToolbarEditorRefAttributes[]>([]);
  const curFocusedIndex = useRef<number>(-1);
  const dirtyRef = useRef(false);
  const makeDirty = ()=>{
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirty();
    }        
  }
  useEffect(()=>{
    if (toolbarEditorRef.current&&toolbarRef.current) {
      const quill = getEditorQuill(toolbarEditorRef.current, toolbarRef.current,makeDirty);
      toolbarEditorQuillRef.current = quill;
      quill.on('text-change', () => {
        // 현재 focus된 field의 readonly 값 변경
        makeDirty();
      });
    }
  },[]);

  return <div className={fieldInputListStyles.fieldInputListContainer}>
    <div className={fieldInputListStyles.fakeLabel}>{tCommon('fields')}</div>
    <EditorToolbar toolbarRef={toolbarRef} show={true}/>
    {
      toolbarEditorQuillRef.current!== null&&fields.map((field, index) => {
        return <SharedToolbarEditor 
          key={index} 
          field={field} 
          toolbarQuill={toolbarEditorQuillRef.current!}
          isEditing={true}
          onDirty={()=>{makeDirty();}}
          moveFocus={()=>{
            editorRefs.current[curFocusedIndex.current].blur();
            editorRefs.current[index].focus();
            curFocusedIndex.current = index;
          }}
          ref={e=>{if (e) editorRefs.current[index] = e}}
          />
      })
    }
    <div
      id='content'
      ref={toolbarEditorRef}
      className={fieldInputListStyles.editor}/>
  </div>;
};
export default FieldInputList;