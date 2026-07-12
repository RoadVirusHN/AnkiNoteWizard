import useInspection from "@/panel/hooks/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import { FieldData } from "@/types/scanRule.types";
import { useTranslation } from "react-i18next";
import { convertQuillToAnkiPureHtml, onFieldDrop, onFieldPaste } from "@/panel/utils/functions";
import { ChangeEventHandler, useEffect, useRef } from "react";
import fieldInputStyle from "./fieldInput.module.css";
import Quill from "quill";
import 'quill/dist/quill.snow.css';

const FieldInput = ({field,onChange}:{field:FieldData,onChange:(newContent:string)=>void}) => {
  //TODO: Implement FieldInput component
  /*
    Features to implement:
    1. HTML Code Editor for inputting field content
    ~~2. onDrag & onPaste handlers to support media file input (images, audio, video)~~
    3. (Later) Simple Preview of the content being inputted (rendering HTML tags for media) with expand/collapse functionality.
    4. (Later) Anki template variables support (e.g., {{FieldName}}) with auto-suggestions based on the current note type's fields
  */
  const {enterInspectionMode} = useInspection();
  const {t} = useTranslation('components',{keyPrefix: 'fieldInput'});
  const {key, content} = field;

  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  useEffect(()=>{
    if (!editorRef.current) return;
    if (!isMounted.current) {
      // prevent double toolbar by strict mode
      isMounted.current = true;
      return;
    }
    const editorQuill = new Quill(editorRef.current,
      {
        debug: 'warn',
        theme: 'snow',
        modules: {
          toolbar: true,
        }
      }
    );

    editorQuill.root.innerHTML = content;
    editorQuill.on('text-change', function(delta, oldDelta, source) {
      if (source === 'user') {
        const newContent = convertQuillToAnkiPureHtml(editorQuill.root.innerHTML);
        onChange(newContent);
      }
    });
    return ()=>{
      editorQuill.off('text-change');      
    };
  },[]);


  return <div className={fieldInputStyle.container}>
    <div className={fieldInputStyle.header}>
      <label htmlFor={key} className={fieldInputStyle.fieldName}>{key}</label>
      <img style={{cursor: 'pointer'}} title="Extract Data" src={MagicIcon} onClick={()=>{enterInspectionMode();}}/> 
    </div>
       
    <div onClick={(e)=>{e.stopPropagation();}} >
      <div
        id='content'
        ref={editorRef}
        /> 
    </div>
    {/* <textarea  
      id={key}
      className={fieldInputStyle.textarea}
      placeholder={t("fieldContentPlaceholder")}
      value={content}
      onChange={onChange}
      onPaste={onFieldPaste(onChange)}
      onDrop={onFieldDrop(onChange)}
      onDragOver={(e)=>{e.preventDefault()}}
    /> */}
  </div>;
};
export default FieldInput;