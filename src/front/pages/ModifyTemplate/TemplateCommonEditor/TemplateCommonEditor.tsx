const TemplateCommonEditor = ({}) => {
  return <div>

  <div className={modifyTemplateStyle.formGroup}>
    <label>Model Name (Anki)</label>
    <input
      className={modifyTemplateStyle.input}
      value={templateData.modelName}
      onChange={(e) => setTemplateData({ ...templateData, modelName: e.target.value })}
    />
  </div>
  <div className={modifyTemplateStyle.formGroup}>
    <label>URL Patterns</label>
    <input
      className={modifyTemplateStyle.input}
      value={templateData.urlPatterns.join(", ")}
      onChange={(e) => setTemplateData({ ...templateData, urlPatterns: e.target.value.split(",").map(s=>s.trim()) })}
      placeholder="*"
    />
  </div>
  <div> tags</div>
  <div className={modifyTemplateStyle.formGroup}>
    <label>Root Tag (Container) <span className={modifyTemplateStyle.req}>*</span></label>
    <div className={modifyTemplateStyle.inputWithBtn}>
      <input
        className={modifyTemplateStyle.input}
        value={templateData.rootTag}
        onChange={(e) => setTemplateData({ ...templateData, rootTag: e.target.value })}
        placeholder="e.g. div.card-body"
      />
      <button 
        className={modifyTemplateStyle.pickBtn} 
        onClick={() => handlePickElement((sel) => setTemplateData({...templateData, rootTag: sel}))}
        title="Pick from Page"
      >
        🎯
      </button>
    </div>
    <p className={modifyTemplateStyle.hint}>Fields will be searched inside this tag.</p>
  </div>



  </div>;
};
export default TemplateCommonEditor;