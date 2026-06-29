import { FieldData } from "@/types/scanRule.types";
import detectPageStyle from "../detectPage.module.css";
import { useTranslation } from "react-i18next";

const FieldScanInput = ({field, isEditing, setCurrentField}:{field:FieldData, isEditing: boolean, setCurrentField:(newField:FieldData)=>void}) => {
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  const containedTooManyEmpty = field.content.length - renderedContent.length > 30;
  const {t} = useTranslation('components', {keyPrefix:'fieldScanInput'});
  return <div className={detectPageStyle.fieldInput}>
    <label 
    className={`${detectPageStyle.fieldLabel}` + (containedTooManyEmpty && ` ${detectPageStyle.veryEmpty}`)}
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
        onChange={(v)=>{setCurrentField({key: field.key, content: v.target.value ?? ''})}}
      /> :
      <div>{field.content.length > 40 ? field.content.slice(0,40)+'...' : field.content}</div>
    }
  </div>;
};
export default FieldScanInput;