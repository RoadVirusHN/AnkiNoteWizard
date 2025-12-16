import useTemplates, { TEMPLATE_CODE} from "@/front/utils/useTemplates";
import { useParams } from "react-router";
import { useState } from "react";
import modifyTemplateStyle from "./modifyTemplate.module.css";
import type { Template } from "@/front/utils/useTemplates";
import TemplateSideEditor from "./TemplateSideEditor/TemplateSideEditor";
import TemplateMetaEditor from "./TemplateMetaEditor/TemplateMetaEditor";
import TemplateCommonEditor from "./TemplateCommonEditor/TemplateCommonEditor";
import ModifyTemplateHeader from "./ModifyTemplateHeader/ModifyTemplateHeader";

enum TAB { META="meta",COMMON='common' ,FRONT="front", BACK="back" };

const ModifyTemplate = () => {
  const { index } = useParams();
  const isEditMode = index !== undefined;
  const idx = isEditMode ? parseInt(index) : undefined;
  const { templates, addTemplate, modifyTemplate } = useTemplates();
  const [activeTab, setActiveTab] = useState<TAB>(TAB.META);
  const [templateData, setTemplateData] = useState<Template>(isEditMode? templates[idx!]:{
    templateName: "",
    meta: { author: "", description: "", version: "0.0.1" },
    modelName: "Basic",
    urlPatterns: ["*"],
    rootTag: "div.word",
    tags: [],
    Front: { html: "<h2>{{front}}</h2>", fields: [] },
    Back: { html: "<p>{{back}}</p>", fields: [] },
  });
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const changeTemplatData = (updatedData: Template) => {
    setIsChanged(true);
    setTemplateData(updatedData);
  };
  const handleSave = () => {
    const code = isEditMode && idx !== undefined ? 
      modifyTemplate(templates[idx].templateName, templateData) :
      addTemplate(templateData);
    if (code===TEMPLATE_CODE.OK) {
      setIsChanged(false);
    } else {
      alert(`Error occurred: ${code}`);
      return;
    }
  };

  const handleCancle = () => {
    if (isEditMode && idx !== undefined) {
      setTemplateData(templates[idx]);
    } else {
      setTemplateData({
        templateName: "",
        meta: { author: "", description: "", version: "0.0.1" },
        modelName: "Basic",
        urlPatterns: ["*"],
        rootTag: "div.word",
        tags: [],
        Front: { html: "<h2>{{front}}</h2>", fields: [] },
        Back: { html: "<p>{{back}}</p>", fields: [] },
      });
    }
    setIsChanged(false);
  };
  

return (
    <div className={modifyTemplateStyle.container}>
      <ModifyTemplateHeader 
        title={isEditMode ? "Edit Template" : "New Template"}
        isChanged={isChanged}
        onSave={handleSave}
        onCancle={handleCancle}
      />
      <div className={modifyTemplateStyle.tabs}>
        {Object.values(TAB).map(tab => 
          <button
            key={tab}
            className={`${modifyTemplateStyle.tab} ${activeTab === tab ? modifyTemplateStyle.activeTab : ""}`}
            onClick={() => setActiveTab(tab as TAB)}>
            {tab}
          </button>)}
      </div>
      <div className={modifyTemplateStyle.content}>        
        {activeTab === TAB.META && (
          <TemplateMetaEditor 
            data={templateData} 
            setData={changeTemplatData}/>)}
        {activeTab === TAB.COMMON && (
          <TemplateCommonEditor 
            data={templateData} 
            setData={changeTemplatData}/>)}
        {activeTab === TAB.FRONT && (
          <TemplateSideEditor
            side={"Front"}
            data={templateData.Front}
            setData={(newData) => {
              setTemplateData(prev => ({
                ...prev,
                ["Front"]: newData
              }));
              setIsChanged(true);
            }}
          />
        )}
        {activeTab === TAB.BACK && (
          <TemplateSideEditor
            side={"Back"}
            data={templateData.Back}
            setData={(newData) => {
              setTemplateData(prev => ({
                ...prev,
                ["Back"]: newData
              }));
              setIsChanged(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ModifyTemplate;
