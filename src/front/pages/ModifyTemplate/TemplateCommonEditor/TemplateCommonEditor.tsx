import { Template } from "@/front/utils/useTemplates";
import { InspectionMode } from "@/scripts/content/tagExtraction";
import { MessageType } from "@/scripts/background/messageHandler";
import modifyTemplateStyle from "../modifyTemplate.module.css";
interface Props {
  data : Template;
  setData: (data: Template) => void;
}
const TemplateCommonEditor = ({data, setData}:Props) => {

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
  return (<div>
    <div className={modifyTemplateStyle.formGroup}>
      <label>Model Name (Anki)</label>
      <input
        className={modifyTemplateStyle.input}
        value={data.modelName}
        onChange={(e) => setData({ ...data, modelName: e.target.value })}
      />
    </div>
    <div className={modifyTemplateStyle.formGroup}>
      <label>URL Patterns</label>
      <input
        className={modifyTemplateStyle.input}
        value={data.urlPatterns.join(", ")}
        onChange={(e) => ({ ...data, urlPatterns: e.target.value.split(",").map(s=>s.trim()) })}
        placeholder="*"
      />
    </div>
    <div> tags</div>
    <div className={modifyTemplateStyle.formGroup}>
      <label>Root Tag (Container) <span className={modifyTemplateStyle.req}>*</span></label>
      <div className={modifyTemplateStyle.inputWithBtn}>
        <input
          className={modifyTemplateStyle.input}
          value={data.rootTag}
          onChange={(e) => setData({ ...data, rootTag: e.target.value })}
          placeholder="e.g. div.card-body"
        />
        <button 
          className={modifyTemplateStyle.pickBtn} 
          onClick={() => handlePickElement((sel) => setData({...data, rootTag: sel}))}
          title="Pick from Page"
        >
          🎯
        </button>
      </div>
      <p className={modifyTemplateStyle.hint}>Fields will be searched inside this tag.</p>
    </div>
  </div>);
};
export default TemplateCommonEditor;