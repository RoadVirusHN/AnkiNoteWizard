import useInspection from "@/panel/hooks/useInspection";
import SimpleButton from "../SimpleButton/SimpleButton";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import { FieldData } from "@/types/scanRule.types";
import { useTranslation } from "react-i18next";
import { onFieldDrag, onFieldPaste } from "@/panel/utils/functions";
import { ChangeEventHandler } from "react";
import fieldInputStyle from "./fieldInput.module.css";

const FieldInput = ({field,onChange}:{field:FieldData,onChange:ChangeEventHandler<HTMLTextAreaElement>}) => {
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
  return <div className={fieldInputStyle.container}>
    <div className={fieldInputStyle.header}>
      <label htmlFor={key} className={fieldInputStyle.fieldName}>{key}</label>
      <SimpleButton title="Extract Data" src={MagicIcon} onClick={()=>{enterInspectionMode();}}/> 
    </div>
    <textarea  
      id={key}
      className={fieldInputStyle.textarea}
      placeholder={t("fieldContentPlaceholder")}
      value={content}
      onChange={onChange}
      onPaste={onFieldPaste}
      onDrag={onFieldDrag}
      onDragOver={(e)=>{e.preventDefault()}}
    />
  </div>;
};
export default FieldInput;