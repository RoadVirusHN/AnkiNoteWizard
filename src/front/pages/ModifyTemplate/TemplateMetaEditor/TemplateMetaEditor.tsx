import { Template } from "@/front/utils/useTemplates";
import modifyTemplateStyle from "../modifyTemplate.module.css";

interface Props {
  data : Template;
  setData: (data: Template) => void;
}
const TemplateMetaEditor = ({data, setData}:Props) => {  
  
  // 공통 핸들러: 깊은 객체 업데이트 헬퍼
  const updateMeta = (key: string, value: unknown) => {
    setData({ ...data, meta: { ...data.meta, [key]: value } });
  };
  
  return (<div className={modifyTemplateStyle.settingsForm}>
  <div className={modifyTemplateStyle.formGroup}>
    <label>Template Name <span className={modifyTemplateStyle.req}>*</span></label>
    <input
      className={modifyTemplateStyle.input}
      value={data.templateName}
      onChange={(e) => setData({ ...data, templateName: e.target.value })}
      placeholder="e.g. Eng-Kor Words"
    />
  </div>

  <div className={modifyTemplateStyle.row}>
    <div className={modifyTemplateStyle.formGroup}>
      <label>Author</label>
      <input
        className={modifyTemplateStyle.input}
        value={data.meta.author || ""}
        onChange={(e) => updateMeta("author", e.target.value)}
      />
    </div>
    <div className={modifyTemplateStyle.formGroup}>
      <label>Version</label>
      <input
        className={modifyTemplateStyle.input}
        value={data.meta.version || ""}
        onChange={(e) => updateMeta("version", e.target.value)}
      />
    </div>
  </div>
    
  
  <div className={modifyTemplateStyle.formGroup}>
    <label>Description</label>
    <textarea
      className={modifyTemplateStyle.textarea}
      value={data.meta.description || ""}
      onChange={(e) => updateMeta("description", e.target.value)}
      rows={3}
    />
  </div>
</div>);
};
export default TemplateMetaEditor;