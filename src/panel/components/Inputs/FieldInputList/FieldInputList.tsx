import { useTranslation } from "react-i18next";
import fieldInputListStyles from "./fieldInputList.module.css";
import EditorToolbar from "../../Editor/EditorToolbar";
import { createRef, forwardRef, RefObject, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { FieldData } from "@/types/scanRule.types";
import FieldInput from "../FieldInput/FieldInput";
import SharedToolbarEditor, { SharedToolbarEditorRefAttributes } from "../SharedToolbarEditor/SharedToolbarEditor";
import Quill from "quill";
import { getEditorQuill } from "@/panel/utils/quillUtils";

export interface FieldInputListHandle {
  getFields(): FieldData[];
  getQuill(index:number): Quill | null;
  reset(): void;
  saved(): void;
  deleted(): void;
}

interface Props {
  fields: FieldData[];
  onDirty: () => void;
  isEditing: boolean;
}

const FieldInputList = forwardRef<FieldInputListHandle,Props>(({fields, onDirty, isEditing}, ref) => {
  const {t:tCommon} = useTranslation('common');
  const curFocusedIndex = useRef<number>(isEditing? 0 : -1);
  const toolbarRefs = useMemo(
    () => fields.map(() => createRef<HTMLDivElement>()),
    [fields.length]
  );
  const fieldInputRefs = useMemo(() => fields.map(() => createRef<SharedToolbarEditorRefAttributes>()), [fields.length]);
  useImperativeHandle(ref, () => ({
    getFields: () => fieldInputRefs.map((fieldInputRef,i) => ({key:fields[i].key,content:fieldInputRef.current?.getContent()||''})),
    getQuill: (index:number) => {
      return fieldInputRefs[index]?.current?.editorQuill || null;
    },
    reset: () => {
      fieldInputRefs.forEach((fieldInputRef, i) => {
        fieldInputRef.current?.reset(fields[i].content);
      });
    },
    saved: () => {
      fieldInputRefs.forEach((fieldInputRef, i) => {
        fieldInputRef.current?.saved();
      });
    },
    deleted: () => {
      fieldInputRefs.forEach((fieldInputRef, i) => {
        fieldInputRef.current?.deleted();
      });
    }
  }));
  useEffect(()=>{
    fields.forEach((field, index)=>{
      toolbarRefs[index].current?.style.setProperty('display', isEditing&&index === curFocusedIndex.current ? 'flex' : 'none');
    });
  },[fields,isEditing]);

  return <div className={fieldInputListStyles.fieldInputListContainer}>
    <div className={fieldInputListStyles.fakeLabel}>{tCommon('fields')}</div>
    {
      isEditing&&fields.map((field, index)=>{
        return <EditorToolbar key={index} toolbarRef={toolbarRefs[index]}/>
      })
    }
    {
      // TODO: Field label, scrollable field lists
     isEditing&&fields.map((field, index) => {
        return <FieldInput 
          key={index}
          ref={fieldInputRefs[index]}
          field={field}
          toolbarRef={toolbarRefs[index]}
          onDirty={onDirty}
          changeFocus={()=>{
            const curFocusedToolbar = toolbarRefs[curFocusedIndex.current]?.current;
            if (curFocusedToolbar) {
              curFocusedToolbar.style.display = "none";
            }
            curFocusedIndex.current = index;
            const editorToolbar = toolbarRefs[index]?.current;
            if (editorToolbar) {
              editorToolbar.style.display = "flex";
            }
          }}
          />
      })
    }
  </div>;
});
export default FieldInputList;