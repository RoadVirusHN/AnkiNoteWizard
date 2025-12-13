import useTemplates, { TemplateFieldDataType } from "@/front/utils/useTemplates";
import { useNavigate, useParams } from "react-router";
import { useEffect,useState } from "react";
import modifyTemplateStyle from "./modifyTemplate.module.css";
import type { Template, } from "@/front/utils/useTemplates";

import SimpleButton from "@/front/common/SimpleButton/SimpleButton";
import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import TemplateSideEditor from "./TemplateSideEditor/TemplateSideEditor";
import { InspectionMode } from "@/scripts/content/tagExtraction";
import { MessageType } from "@/scripts/background/messageHandler";
import TemplateMetaEditor from "./TemplateMetaEditor/TemplateMetaEditor";
// 탭 상수
const TAB = { META: "meta",COMMON: 'common' ,FRONT: "front", BACK: "back" } as const;
type TabType = typeof TAB[keyof typeof TAB];

const ModifyTemplate = () => {
  const { index } = useParams();
  const isEditMode = index !== undefined;
  const idx = isEditMode ? parseInt(index) : undefined;
  const { templates, addTemplate, modifyTemplate } = useTemplates();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>(TAB.META);
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
  // 공통 핸들러: 깊은 객체 업데이트 헬퍼
  const updateMeta = (key: string, value: unknown) => {
    setTemplateData(prev => ({ ...prev, meta: { ...prev.meta, [key]: value } }));
  };

  const handleSave = () => {
    if (!templateData.templateName.trim()) {
      alert("Card Name is required.");
      return;
    }
    if (isEditMode && idx !== undefined) modifyTemplate(templates[idx].templateName, templateData);
    else addTemplate(templateData);
    navigate("/templates");
  };

  // 픽커(추출) 기능 모의 함수
  const handlePickElement = async (callback: (selector: string) => void) => {
    console.log("Entering inspect mode for element picking...");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      console.warn('No active tab found!');
      return;
    }
    chrome.tabs.sendMessage(tab.id, {
      type: MessageType.ENTER_INSPECTION_MODE_FROM_PANEL,
      mode: InspectionMode.TAG_EXTRACTION
    });
  };

return (
    <div className={modifyTemplateStyle.container}>
      {/* Header */}
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

      {/* Tabs */}
      <div className={modifyTemplateStyle.tabs}>
        <button 
          className={`${modifyTemplateStyle.tab} ${activeTab === TAB.META ? modifyTemplateStyle.activeTab : ""}`} 
          onClick={() => setActiveTab(TAB.META)}
        >
          Meta
        </button>        
        <button 
          className={`${modifyTemplateStyle.tab} ${activeTab === TAB.COMMON ? modifyTemplateStyle.activeTab : ""}`} 
          onClick={() => setActiveTab(TAB.COMMON)}
        >
          Common
        </button>
        <button 
          className={`${modifyTemplateStyle.tab} ${activeTab === TAB.FRONT ? modifyTemplateStyle.activeTab : ""}`} 
          onClick={() => setActiveTab(TAB.FRONT)}
        >
          Front
        </button>
        <button 
          className={`${modifyTemplateStyle.tab} ${activeTab === TAB.BACK ? modifyTemplateStyle.activeTab : ""}`} 
          onClick={() => setActiveTab(TAB.BACK)}
        >
          Back
        </button>
      </div>
      <div className={modifyTemplateStyle.content}>        
        {activeTab === TAB.META && (
          <TemplateMetaEditor/>
        )}

        {/* --- FRONT / BACK TABS --- */}
        {(activeTab === TAB.FRONT || activeTab === TAB.BACK) && (
          <TemplateSideEditor
            side={activeTab === TAB.FRONT ? "Front" : "Back"}
            data={activeTab === TAB.FRONT ? templateData.Front : templateData.Back}
            // 상위 State 업데이트
            onChange={(newData) => {
              setTemplateData(prev => ({
                ...prev,
                [activeTab === TAB.FRONT ? "Front" : "Back"]: newData
              }));
            }}
            onPickElement={handlePickElement}
          />
        )}
      </div>
    </div>
  );
};

export default ModifyTemplate;
