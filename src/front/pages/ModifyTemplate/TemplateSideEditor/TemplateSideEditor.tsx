import React, { useMemo } from "react";
import Editor from "@monaco-editor/react";
import styles from "../modifyTemplate.module.css";
import { Template, TemplateField, TemplateFieldDataType } from "@/front/utils/useTemplates";
import useLocale from "@/front/utils/useLocale";
import useConfigure, { Theme } from "@/front/utils/useConfigure";
import InspectionButton from "@/front/common/InspectionOverlay/InspectionOverlay";
import { InspectionMode } from "@/scripts/content/tagExtraction";

interface SideData {
  html: string;
  fields: TemplateField[];
}

interface Props {
  side: "Front" | "Back";
  template: Template;
  data: SideData;
  setData: (data: SideData) => void;
}

const TemplateSideEditor: React.FC<Props> = ({ side, template, data, setData }) => {
  
  // -- Handlers --
  const handleHtmlChange = (val: string | undefined) => {
    setData({ ...data, html: val || "" });
  };

  const handleFieldChange = (idx: number, key: keyof TemplateField, val: unknown) => {
    const newFields = [...data.fields];
    newFields[idx] = { ...newFields[idx], [key]: val };
    setData({ ...data, fields: newFields });
  };

  const addField = () => {
    setData({
      ...data,
      fields: [...data.fields, { name: "", content: "", dataType: TemplateFieldDataType.TEXT, isOptional: true }]
    });
  };

  const removeField = (idx: number) => {
    setData({ ...data, fields: data.fields.filter((_, i) => i !== idx) });
  };

  // -- Preview Logic --
  const previewHtml = useMemo(() => {
    let html = data.html;
    data.fields.forEach(field => {
      if (!field.name) return;
      const placeholder = `{{${field.name}}}`;
      // 미리보기용 가짜 데이터 생성
      let dummyVal = `(No Data)`;
      if (field.dataType === 'image') dummyVal = `<div style="background:#ddd; width:50px; height:50px; display:inline-flex; align-items:center; justify-content:center;">IMG</div>`;
      else if (field.dataType === 'audio') dummyVal = `[Audio: ${field.name}]`;
      else dummyVal = `<span style="color:blue; background:#eef;">[${field.name}]</span>`;

      html = html.replaceAll(placeholder, dummyVal);
    });
    return html;
  }, [data.html, data.fields]);

  // 필수 필드(front/back)인지 확인 (이름 수정/삭제 불가)
  const isLockedField = (name: string) => {
    return (side === "Front" && name === "front") || (side === "Back" && name === "back");
  };
  const tl = useLocale('pages.ModifyTemplate.TemplateSideEditor');
  const {themeOption} = useConfigure();
  return (
    <div className={styles.editorContainer}>
      {/* 1. Preview Area */}
      <div className={styles.sectionTitle}>{tl('Preview')}</div>
      <div className={styles.previewBox}>
        <div 
          className={styles.previewContent}
          dangerouslySetInnerHTML={{ __html: previewHtml }} 
        />
      </div>

      {/* 2. HTML Editor */}
      <div className={styles.sectionTitle}>{tl('HTML Code')}</div>
      <div className={styles.monacoWrapper}>
        <Editor
          height="120px"
          defaultLanguage="html"
          value={data.html}
          theme={themeOption.theme === Theme.DARK ? "vs-dark" : "light"}
          onChange={handleHtmlChange}
          options={{ minimap: { enabled: false }, lineNumbers: 'off', folding: false, padding: { top: 8 } }}
        />
      </div>

      {/* 3. Fields List */}
      <div className={styles.fieldHeader}>
        <div className={styles.sectionTitle} style={{marginBottom:0}}>{tl('Fields')}</div>
        <button className={styles.addBtn} onClick={addField}>{'+ '+ tl('Add Field')}</button>
      </div>
      
      <div className={styles.fieldsList}>
        {data.fields.map((field, i) => {
          const locked = isLockedField(field.name);
          return (
            <div key={i} className={styles.fieldRow}>
              {/* Field Name */}
              <input
                className={`${styles.input} ${styles.fieldName}`}
                value={field.name}
                placeholder={tl("Name")}
                onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                disabled={locked} // Lock mandatory names
                title={locked ? tl("Cannot change mandatory field") : tl("Displaying Field Name")}
              />
              
              {/* CSS Selector + Picker */}
              <div className={styles.selectorWrapper}>
                <input
                  className={`${styles.input} ${styles.fieldSelector}`}
                  value={field.content}
                  placeholder={tl("CSS Selector")}
                  onChange={(e) => handleFieldChange(i, "content", e.target.value)}
                />
                <InspectionButton setResult={() => ((sel:string) => handleFieldChange(i, "content", sel))} mode={InspectionMode.FIELD_EXTRACTION} rootSelector={template.rootTag}></InspectionButton>
              </div>

              {/* Data Type */}
              <select
                className={styles.select}
                value={field.dataType}
                onChange={(e) => handleFieldChange(i, "dataType", e.target.value)}
              >
                <option value="text">{tl('Text')}</option>
                <option value="image">{tl('Image')}</option>
                <option value="audio">{tl('Audio')}</option>
              </select>

              {/* Optional Checkbox */}
              <div className={styles.chkWrapper} title={tl("Is Optional")}>
                 <input
                  type="checkbox"
                  checked={field.isOptional}
                  disabled={locked}
                  title={locked ? tl("Cannot change mandatory field") : tl("Is Optional")}
                  style={{ opacity: locked ? 0.3 : 1 }}
                  onChange={(e) => handleFieldChange(i, "isOptional", e.target.checked)}
                />
                <span className={styles.chkLabel}>?</span>
              </div>

              {/* Delete */}
              <button
                className={styles.delBtn}
                onClick={() => removeField(i)}
                disabled={locked}
                style={{ opacity: locked ? 0.3 : 1 }}
                title={locked? tl("Cannot change mandatory field") : ""}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSideEditor;