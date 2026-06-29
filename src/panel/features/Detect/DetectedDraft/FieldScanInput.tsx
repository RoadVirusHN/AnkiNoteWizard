import { FieldData } from "@/types/scanRule.types";
import detectPageStyle from "../detectPage.module.css";

const FieldScanInput = ({field, isEditing, setCurrentField}:{field:FieldData, isEditing: boolean, setCurrentField:(newField:FieldData)=>void}) => {
  const renderedContent = field.content.replace(/\s+/g, ' ').trim();
  // TODO: rendering 시 공백 처리 문제
  return <div className={detectPageStyle.fieldInput}>
    <label htmlFor="content">{field.key}</label>
    {
      isEditing ? 
      <textarea
        id='content'
        className={detectPageStyle.field}
        value={field.content.split('\n').map(line => line.trim()).join('\n').trim()}
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