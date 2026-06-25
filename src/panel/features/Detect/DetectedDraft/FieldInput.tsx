import { Draft, FieldData } from "@/types/scanRule.types";
import { Editor } from "@monaco-editor/react";
import detectPageStyle from "../detectPage.module.css";
import useConfigure from "@/panel/stores/useConfigure";
import { THEME } from "@/types/app.types";

const FieldInput = ({field, isEditing, setCurrentField}:{field:FieldData, isEditing: boolean, setCurrentField:(newField:FieldData)=>void}) => {
  const {themeOption} = useConfigure();
  return <div>
    <label htmlFor="">{field.key}</label>
    {
      isEditing ? 
      <Editor 
        className={detectPageStyle.field}
        defaultLanguage="html"
        value={field.content}
        onChange={(v)=>{setCurrentField({key: field.key, content: v ?? ''})}}
        theme={themeOption.theme==THEME.DARK ? "vs-dark" : "light"}
      /> :
      <p>{field.content}</p>
    }

  </div>;
};
export default FieldInput;