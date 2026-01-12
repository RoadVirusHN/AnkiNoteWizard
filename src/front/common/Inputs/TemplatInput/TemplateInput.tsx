import { useState } from "react";
import useTemplate from "@/front/utils/useTemplates";
const TemplateInput = ({setTemplate, defaultTemplate}:{setTemplate: (model:string)=>void, defaultTemplate: string}) => {
  const {templates} = useTemplate();
  const [curVal, setCurVal] = useState(defaultTemplate || 'Empty'); 
  const onChangeModel = (template:string) => {
    if (templates.length===0) return;
    setTemplate(template);
  }
  return (
    <div>
      <label htmlFor="template-select">
        Template
      </label>
      <select id="template-select" name="template-select" style={{height: '20px', width: '180px'}} onChange={(e)=>{
        onChangeModel(e.currentTarget.value); 
        setCurVal(e.currentTarget.value);
      }} value={curVal}>
        <option value='Empty'>Empty</option>          
        {templates.map((template) => <option key={template.templateName} value={template.templateName}>{template.templateName}</option>)}
      </select>
    </div>
  );
};
export default TemplateInput;