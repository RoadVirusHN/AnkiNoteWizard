import { FieldData } from "@/types/scanRule.types";
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import { useTranslation } from "react-i18next";
import { onFieldDrop, onFieldPaste } from "@/panel/utils/functions";
import { ChangeEvent, useEffect, useRef } from "react";
import Quill from "quill";
import 'quill/dist/quill.snow.css';
import { editor } from "monaco-editor";

const MAX_CONTENT_LENGTH = 100;
const FieldScanInput = ({field, isEditing, setCurrentField}:{field:FieldData, isEditing: boolean, setCurrentField:(newField:FieldData)=>void}) => {
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  const containedTooManyEmpty = field.content.length - renderedContent.length > 30;
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  useEffect(()=>{
    if (!editorRef.current) return;
    if (!isMounted.current) {
      // prevent double toolbar by strict mode
      isMounted.current = true;
      return;
    }
    const quill = new Quill(editorRef.current,
      {
        debug: 'warn',
        theme: 'snow',
        modules: {
          toolbar: true
        }
      }
    );
    quill.root.innerHTML = field.content;
    quill.on('text-change', function(delta, oldDelta, source) {
      if (source === 'user') {
        const newContent = quill.root.innerHTML;
        setCurrentField({key: field.key, content: newContent});
      }
    });
    const parent = editorRef.current.parentElement;
    console.log(parent);
    return ()=>{
      quill.off('text-change');
    };
  },[]);
  // onChange={onChange}
  // onPaste={onFieldPaste(onChange)}
  // onDrop={onFieldDrop(onChange)}
  // onDragOver={(e)=>{e.preventDefault()}}
  return <div className={detectedDraftStyles.fieldInput}>
       <label 
      className={`${detectedDraftStyles.fieldLabel}` + (containedTooManyEmpty ? ` ${detectedDraftStyles.veryEmpty}` : '')}
      htmlFor="content"
      title={containedTooManyEmpty ?t('containedTooManyEmptyWarn'):''}
      >{field.key}</label>
      <div className={detectedDraftStyles.field} style={{display: isEditing ? 'block' : 'none'}} onClick={(e)=>{e.stopPropagation();}} >
        <div
          id='content'
          ref={editorRef}
          /> 
      </div>
      <div
      style={{display: isEditing ? 'none' : 'block'}}
      >{field.content.length > MAX_CONTENT_LENGTH ? field.content.slice(0,MAX_CONTENT_LENGTH)+'...' : field.content}</div>
    </div>;
};
export default FieldScanInput;