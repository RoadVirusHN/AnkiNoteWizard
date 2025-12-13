import modifyTemplateStyle from "./modifyTemplate.module.css";
const TemplateMetaEditor = ({templateData }) => {
  return (<div className={modifyTemplateStyle.settingsForm}>
  <div className={modifyTemplateStyle.formGroup}>
    <label>Template Name <span className={modifyTemplateStyle.req}>*</span></label>
    <input
      className={modifyTemplateStyle.input}
      value={templateData.templateName}
      onChange={(e) => setTemplateData({ ...templateData, templateName: e.target.value })}
      placeholder="e.g. Eng-Kor Words"
    />
  </div>

  <div className={modifyTemplateStyle.row}>
    <div className={modifyTemplateStyle.formGroup}>
      <label>Author</label>
      <input
        className={modifyTemplateStyle.input}
        value={templateData.meta.author || ""}
        onChange={(e) => updateMeta("author", e.target.value)}
      />
    </div>
    <div className={modifyTemplateStyle.formGroup}>
      <label>Version</label>
      <input
        className={modifyTemplateStyle.input}
        value={templateData.meta.version || ""}
        onChange={(e) => updateMeta("version", e.target.value)}
      />
    </div>
  </div>
    
  
  <div className={modifyTemplateStyle.formGroup}>
    <label>Description</label>
    <textarea
      className={modifyTemplateStyle.textarea}
      value={templateData.meta.description || ""}
      onChange={(e) => updateMeta("description", e.target.value)}
      rows={3}
    />
  </div>
</div>);
};
export default TemplateMetaEditor;