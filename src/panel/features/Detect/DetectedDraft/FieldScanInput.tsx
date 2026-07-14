import { FieldData } from "@/types/scanRule.types";
import detectedDraftStyles from "@/panel/features/Detect/DetectedDraft/detectedDraft.module.css";
import { useTranslation } from "react-i18next";
import { convertQuillToAnkiPureHtml, onFieldDrop, onFieldPaste } from "@/panel/utils/functions";
import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import 'quill/dist/quill.snow.css';
import EditorToolbar from "@/panel/components/Editor/EditorToolbar";
const MAX_CONTENT_LENGTH = 100;

//TODO : Editor view && HTML View 
const FieldScanInput = ({field, isEditing, setCurrentField}:{field:FieldData, isEditing: boolean, setCurrentField:(newField:FieldData)=>void}) => {
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  const containedTooManyEmpty = field.content.length - renderedContent.length > 30;
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  
  const editorRef = useRef<HTMLDivElement>(null);
  const editorToolbarRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const [isFocusing, setIsFocusing] = useState(false);
  const focus = () => setIsFocusing(true);
  const blur = () => setIsFocusing(false);
  useEffect(()=>{
    if (!editorRef.current||!editorToolbarRef.current||!previewRef.current) return;
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
          toolbar: editorToolbarRef.current,
        }
      }
    );
    const previewQuill = new Quill(previewRef.current,
      {
        debug: 'warn',
        theme: 'snow',
        readOnly: true,
        modules: {
          toolbar: false
        }
      }
    );
    editorQuill.root.innerHTML = field.content;
    previewQuill.root.innerHTML = field.content;
    editorQuill.on('text-change', function(delta, oldDelta, source) {
      if (source === 'user') {
        console.log("original:", editorQuill.root.innerHTML);
        const newContent = convertQuillToAnkiPureHtml(editorQuill.root.innerHTML);
        setCurrentField({key: field.key, content: newContent});
        previewQuill.root.innerHTML = newContent;
        console.log("source:", source," changed:",newContent);
      }
    });
    editorQuill.root.addEventListener('focus',focus);
    editorQuill.root.addEventListener('blur', blur)
    return ()=>{
      editorQuill.off('text-change');  
      editorQuill.root.removeEventListener('focus',focus);
      editorQuill.root.removeEventListener('blur',blur);
    };
  },[]);
  // onPaste={onFieldPaste(onChange)}
  // onDrop={onFieldDrop(onChange)}
  // onDragOver={(e)=>{e.preventDefault()}}
  return <div className={detectedDraftStyles.fieldInput}>
       <label 
      className={`${detectedDraftStyles.fieldLabel}` + (containedTooManyEmpty ? ` ${detectedDraftStyles.veryEmpty}` : '')}
      htmlFor="content"
      title={containedTooManyEmpty ?t('containedTooManyEmptyWarn'):''}
      >{field.key}</label>
      <div className={detectedDraftStyles.fields}>
        <div className={detectedDraftStyles.field} style={{display: isEditing ? 'block' : 'none'}} onClick={(e)=>{e.stopPropagation();}} >
          <EditorToolbar toolbarRef={editorToolbarRef} isFocusing={isFocusing} />
          <div
            id='content'
            ref={editorRef}/> 
        </div>
        <div className={detectedDraftStyles.field} style={{display: isEditing ? 'none' : 'block'}} onClick={(e)=>{e.stopPropagation();e.preventDefault();}} >
          <div
            id='content'
            ref={previewRef}
            /> 
        </div>
      </div>
    </div>;
};
export default FieldScanInput;