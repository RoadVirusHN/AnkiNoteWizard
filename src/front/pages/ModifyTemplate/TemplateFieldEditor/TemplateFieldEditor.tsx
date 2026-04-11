import { useMemo } from "react";
import Editor from "@monaco-editor/react";
import styles from "../modifyTemplate.module.css";
import { Template, TemplateItem, TemplateItemDataType } from "@/front/utils/useTemplates";
import useLocale from "@/front/utils/useLocale";
import useConfigure, { Theme } from "@/front/utils/useConfigure";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import InspectionOverlay from "@/front/common/InspectionOverlay/InspectionOverlay";
import useInspection from "@/front/utils/useInspection";
import { uniqueCssSelectorOptions } from "@/content/App";
import SimpleButton from "@/front/common/SimpleButton/SimpleButton";
import { InspectionMode } from "@/scripts/content/constants";

interface FieldData {
  html: string;
  items: TemplateItem[];
}

interface Props {
  fieldName: string;
  template: Template;
  setData: (data: FieldData) => void;
}

const TemplateFieldEditor = ({ fieldName, template, setData } : Props) => {
  const {
    enterInspectionMode,
    cancleInspectionMode,
    isInspectionMode
  } = useInspection(InspectionMode.TAG_EXTRACTION, template.rootTag, uniqueCssSelectorOptions);
  const data = template.fields.find(f => f.name === fieldName) || { html: "", items: [] };
  // -- Handlers --
  const handleHtmlChange = (val: string | undefined) => {
    setData({ ...data, html: val || "" });
  };

  const handleItemChange = (idx: number, key: keyof TemplateItem, val: unknown) => {
    const newItems = [...data.items];
    newItems[idx] = { ...newItems[idx], [key]: val };
    setData({ ...data, items: newItems });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { name: "", content: "", dataType: TemplateItemDataType.TEXT, isOptional: true }]
    });
  };

  const removeItem = (idx: number) => {
    setData({ ...data, items: data.items.filter((_, i) => i !== idx) });
  };

  // -- Preview Logic --
  const previewHtml = useMemo(() => {
    let html = data.html;
    data.items.forEach(field => {
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
  }, [data.html, data.items]);

  // 필수 필드(front/back)인지 확인 (이름 수정/삭제 불가)
  const isLockedItem = (name: string) => {
    return template.fields.some(f => f.name === fieldName);
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

      {/* 3. Items List */}
      <div className={styles.fieldHeader}>
        <div className={styles.sectionTitle} style={{marginBottom:0}}>{tl('Fields')}</div>
        <button className={styles.addBtn} onClick={addItem}>{'+ '+ tl('Add Field')}</button>
      </div>
      
      <div className={styles.fieldsList}>
        {data.items.map((item, i) => {
          const locked = isLockedItem(item.name);
          const onResult = (sel:string) => handleItemChange(i, "content", sel);
          return (
            <div key={i} className={styles.fieldRow}>
              {/* Field Name */}
              <input
                className={`${styles.input} ${styles.fieldName}`}
                value={item.name}
                placeholder={tl("Name")}
                onChange={(e) => handleItemChange(i, "name", e.target.value)}
                disabled={locked} // Lock mandatory names
                title={locked ? tl("Cannot change mandatory field") : tl("Displaying Field Name")}
              />
              
              {/* CSS Selector + Picker */}
              <div className={styles.selectorWrapper}>
                <input
                  className={`${styles.input} ${styles.fieldSelector}`}
                  value={item.content}
                  placeholder={tl("CSS Selector")}
                  onChange={(e) => handleItemChange(i, "content", e.target.value)}
                />
                <SimpleButton title="Extract Field Css Selector" src={MagicIcon} onClick={()=>enterInspectionMode(onResult)}/> 
              </div>

              {/* Data Type */}
              <select
                className={styles.select}
                value={item.dataType}
                onChange={(e) => handleItemChange(i, "dataType", e.target.value)}
              >
                <option value="text">{tl('Text')}</option>
                <option value="image">{tl('Image')}</option>
                <option value="audio">{tl('Audio')}</option>
              </select>

              {/* Optional Checkbox */}
              <div className={styles.chkWrapper} title={tl("Is Optional")}>
                 <input
                  type="checkbox"
                  checked={item.isOptional}
                  disabled={locked}
                  title={locked ? tl("Cannot change mandatory field") : tl("Is Optional")}
                  style={{ opacity: locked ? 0.3 : 1 }}
                  onChange={(e) => handleItemChange(i, "isOptional", e.target.checked)}
                />
                <span className={styles.chkLabel}>?</span>
              </div>

              {/* Delete */}
              <button
                className={styles.delBtn}
                onClick={() => removeItem(i)}
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
      {isInspectionMode ?? <InspectionOverlay mode={InspectionMode.TAG_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
    </div>
  );
};

export default TemplateFieldEditor;