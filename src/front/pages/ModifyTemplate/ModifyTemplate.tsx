import useTemplates, { TEMPLATE_CODE, TemplateFieldDataType } from "@/front/utils/useTemplates";
import { useNavigate, useParams } from "react-router";
import { useEffect,useState } from "react";
import modifyTemplateStyle from "./modifyTemplate.module.css";
import type { Template, } from "@/front/utils/useTemplates";

import SimpleButton from "@/front/common/SimpleButton/SimpleButton";
import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import TemplateSideEditor from "./TemplateSideEditor/TemplateSideEditor";
import TemplateMetaEditor from "./TemplateMetaEditor/TemplateMetaEditor";
import TemplateCommonEditor from "./TemplateCommonEditor/TemplateCommonEditor";

enum TAB { META="meta",COMMON='common' ,FRONT="front", BACK="back" };

const ModifyTemplate = () => {
  const { index } = useParams();
  const isEditMode = index !== undefined;
  const idx = isEditMode ? parseInt(index) : undefined;
  const { templates, addTemplate, modifyTemplate } = useTemplates();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TAB>(TAB.META);
  const [templateData, setTemplateData] = useState<Template>({
      templateName: "",
      meta: { author: "", description: "", version: "0.0.1" },
      modelName: "Basic",
      urlPatterns: ["*"],
      rootTag: "div.word",
      tags: [],
      Front: { html: "<h2>{{front}}</h2>", fields: [] },
      Back: { html: "<p>{{back}}</p>", fields: [] },
    });

// 초기 데이터 로드
  useEffect(() => {
    if (isEditMode && idx !== undefined && templates[idx]) {
      setTemplateData(JSON.parse(JSON.stringify(templates[idx]))); // Deep Copy
    } else if (!isEditMode) {
      // 신규 추가 시 기본 필수 필드 설정
      setTemplateData((prev) => ({
        ...prev,
        Front: { ...prev.Front, fields: [{ name: "front", content: "h1", dataType: TemplateFieldDataType.TEXT, isOptional: false }] },
        Back: { ...prev.Back, fields: [{ name: "back", content: "h2", dataType: TemplateFieldDataType.TEXT, isOptional: false }] },
      }));
    }
  }, [isEditMode, idx, templates]);


  const handleSave = () => {
    if (!templateData.templateName.trim()) {
      alert("Card Name is required.");
      return;
    }
    const code = isEditMode && idx !== undefined ? 
      modifyTemplate(templates[idx].templateName, templateData) :
      addTemplate(templateData);
    if (code===TEMPLATE_CODE.OK) navigate("/templates");
  };

return (
    <div className={modifyTemplateStyle.container}>
      <div className={modifyTemplateStyle.header}>
        <div className={modifyTemplateStyle.headerLeft}>
          <SimpleButton Svg={ReturnIcon} onClick={() => navigate("/templates")} />
          <span className={modifyTemplateStyle.title}>{isEditMode ? "Edit Template" : "New Template"}</span>
        </div>
        <SimpleButton 
          Svg={SaveIcon} 
          onClick={handleSave} 
          overridedStyle={{ backgroundColor: "var(--color-warning)", width: "32px", height: "32px" }} 
        />
      </div>
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
            setData={setTemplateData}/>)}
        {activeTab === TAB.COMMON && (
          <TemplateCommonEditor 
            data={templateData} 
            setData={setTemplateData}/>)}
        {activeTab === TAB.FRONT && (
          <TemplateSideEditor
            side={"Front"}
            data={templateData.Front}
            setData={(newData) => {
              setTemplateData(prev => ({
                ...prev,
                ["Front"]: newData
              }));
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
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ModifyTemplate;
