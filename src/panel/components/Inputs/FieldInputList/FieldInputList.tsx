import { useTranslation } from "react-i18next";
import fieldInputListStyles from "./fieldInputList.module.css";
import EditorToolbar from "../../Editor/EditorToolbar";
import { createRef, RefObject, useEffect, useMemo, useRef } from "react";
import { FieldData } from "@/types/scanRule.types";
import FieldInput from "../FieldInput/FieldInput";
import SharedToolbarEditor, { SharedToolbarEditorRefAttributes } from "../SharedToolbarEditor/SharedToolbarEditor";
import Quill from "quill";
import { getEditorQuill } from "@/panel/utils/quillUtils";

export interface FieldInputListHandle {
  getFields(): FieldData[];
  reset(fields: FieldData[]): void;
  saved(): void;
  deleted(): void;
}

interface Props {
  fields: FieldData[];
  onDirty: () => void;
  isEditing: boolean;
}

const FieldInputList = ({fields, onDirty, isEditing}:Props) => {
  const {t:tCommon} = useTranslation('common');
  const curFocusedIndex = useRef<number>(isEditing? 0 : -1);
  const toolbarRefs = useMemo(
    () => fields.map(() => createRef<HTMLDivElement>()),
    [fields.length]
  );
  useEffect(()=>{
    fields.forEach((field, index)=>{
      toolbarRefs[index].current?.style.setProperty('display', isEditing&&index === curFocusedIndex.current ? 'flex' : 'none');
    });
  },[fields,isEditing]);

  return <div className={fieldInputListStyles.fieldInputListContainer}>
    <div className={fieldInputListStyles.fakeLabel}>{tCommon('fields')}</div>
    {
      fields.map((field, index)=>{
        return <EditorToolbar toolbarRef={toolbarRefs[index]}/>
      })
    }
    {
     fields.map((field, index) => {
        return <FieldInput 
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
};
export default FieldInputList;