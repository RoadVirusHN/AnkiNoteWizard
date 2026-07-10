import { FieldData } from "@/types/scanRule.types";
import detectPageStyle from "../detectPage.module.css";
import { useTranslation } from "react-i18next";
import { onFieldDrop, onFieldPaste } from "@/panel/utils/functions";
import { ChangeEvent, useEffect, useRef } from "react";
import Quill from "quill";

const MAX_CONTENT_LENGTH = 100;
const FieldScanInput = ({field, isEditing, setCurrentField}:{field:FieldData, isEditing: boolean, setCurrentField:(newField:FieldData)=>void}) => {
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  const containedTooManyEmpty = field.content.length - renderedContent.length > 30;
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  const onChange = (e:ChangeEvent<HTMLTextAreaElement>)=>{setCurrentField({key: field.key, content: e.target.value ?? ''})};
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if (editorRef.current) {
      const quill = new Quill(editorRef.current,
        {
          debug: 'warn',
          theme: 'snow',
          modules: {
            toolbar: true
          },
          readOnly: !isEditing,
          placeholder: field.content
        }
      );
    }
  },[isEditing]);
  return <div className={detectPageStyle.fieldInput} ref={editorRef}>
    {/* <label 
    className={`${detectPageStyle.fieldLabel}` + (containedTooManyEmpty ? ` ${detectPageStyle.veryEmpty}` : '')}
    htmlFor="content"
    title={containedTooManyEmpty ?t('containedTooManyEmptyWarn'):''}
    >{field.key}</label>
    {
      isEditing ? 
      <textarea
        id='content'
        className={detectPageStyle.field}
        value={field.content}
        onClick={(e)=>{
          e.stopPropagation();
        }}
        onChange={onChange}
        onPaste={onFieldPaste(onChange)}
        onDrop={onFieldDrop(onChange)}
        onDragOver={(e)=>{e.preventDefault()}}
      /> :
      <div>{field.content.length > MAX_CONTENT_LENGTH ? field.content.slice(0,MAX_CONTENT_LENGTH)+'...' : field.content}</div>
    } */}
  </div>;
};
export default FieldScanInput;