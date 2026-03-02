import { Template } from "@/front/utils/useTemplates";
import modifyTemplateStyle from "../modifyTemplate.module.css";
import Tags from "@/front/common/Tags/Tags";
import { useRef } from "react";
import useLocale from "@/front/utils/useLocale";
import InspectionOverlay from "@/front/common/InspectionOverlay/InspectionOverlay";
import { InspectionMode } from "@/scripts/content/tagExtraction";
import SimpleButton from "@/front/common/SimpleButton/SimpleButton";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import useInspection from "@/front/utils/useInspection";
import { nonuniqueCssSelectorOptions } from "@/content/App";

interface Props {
  data : Template;
  setData: (data: Template) => void;
}

const TemplateCommonEditor = ({data, setData}:Props) => {

  const rootTagInputRef = useRef<HTMLInputElement>(null);
  const tl = useLocale('pages.ModifyTemplate.TemplateCommonEditor');
  const onResult = (text: string)=>{
    setData({ ...data, rootTag: text });
    if (rootTagInputRef.current){
      rootTagInputRef.current.value = text;
    };
  }
  const {enterInspectionMode, cancleInspectionMode, isInspectionMode} = useInspection(InspectionMode.TAG_EXTRACTION, data.rootTag, nonuniqueCssSelectorOptions);
  return (<div>
    <div className={modifyTemplateStyle.formGroup}>
      <label>{tl("Model Name")}</label>
      <input
        className={modifyTemplateStyle.input}
        value={data.modelName}
        onChange={(e) => setData({ ...data, modelName: e.target.value })}
      />
    </div>
    <div className={modifyTemplateStyle.formGroup}>
      <label>{tl("URL Patterns")}</label>
      <input
        className={modifyTemplateStyle.input}
        value={data.urlPatterns.join(", ")}
        onChange={(e) => ({ ...data, urlPatterns: e.target.value.split(",").map(s=>s.trim()) })}
        placeholder="*"
      />
    </div>
    <Tags givenTags={data.tags} isModifying={true} onAddTag={
      (newTag) => {
        if (!data.tags.includes(newTag)) {
          setData({ ...data, tags: [...data.tags, newTag] });
        }
      }
    } onRemoveTag={
      (tagToRemove) => {
        setData({ ...data, tags: data.tags.filter(tag => tag !== tagToRemove) });
      }
    }/>
    <div className={modifyTemplateStyle.formGroup}>
      <label>{tl("Root Tag")} <span className={modifyTemplateStyle.req}>*</span></label>
      <div className={modifyTemplateStyle.inputWithBtn}>
        <input
          className={modifyTemplateStyle.input}
          value={data.rootTag}
          onChange={(e) => setData({ ...data, rootTag: e.target.value })}
          ref={rootTagInputRef}
          placeholder="e.g. div.card-body"
        />
      <SimpleButton title="Extract Tag Selector" src={MagicIcon} onClick={()=>enterInspectionMode(onResult)}/> 
     </div>
      <p className={modifyTemplateStyle.hint}>{tl("Fields will be searched under the root tag")}</p>
    </div>
    {isInspectionMode && <InspectionOverlay mode={InspectionMode.TAG_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
  </div>);
};
export default TemplateCommonEditor;