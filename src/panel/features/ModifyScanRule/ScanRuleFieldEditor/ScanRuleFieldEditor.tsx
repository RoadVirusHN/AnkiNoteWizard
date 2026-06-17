import styles from "../modifyScanRule.module.css";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import useInspection from "@/panel/hooks/useInspection";
import { ScanRule, FieldProperties, FieldDataType, FIELD_DATA_TYPES, SELECTOR_TYPES } from "@/types/scanRule.types";
import { INSPECTION_MODE } from "@/types/app.types";
import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import { useTranslation } from "react-i18next";

interface Props {
  scanRule: ScanRule;
  setData: (data: ScanRule) => void;
}

const ScanRuleFieldEditor = ({ scanRule, setData } : Props) => {
  const {
    enterInspectionMode,
    cancleInspectionMode,
    isInspectionMode
  } = useInspection(INSPECTION_MODE.FIELD_EXTRACTION, scanRule.rootTagSelector);

  const handleFieldsChange = (fieldName:string, newData: FieldProperties[]) => {
    const newItems = {...scanRule.fields};
    newItems[fieldName] = newData;
    setData({ ...scanRule, fields: newItems });
  };
  const {t} = useTranslation('page', {keyPrefix: 'modifyScanRule.scanRuleFieldEditor'});
  
  // TODO : 예시 화면 추가 (ex. selector에 따라 추출되는 데이터 미리보기) 
  // TODO : Field 우선순위 기능
  // TODO : XPath, JavaScript Selector 등 다양한 selector 지원
  return (
    <div className={styles.editorContainer}>
      <div className={styles.fieldHeader}>
        <div className={styles.sectionTitle} style={{marginBottom:0}}>{t('fields')}</div>
      </div>
      
      <div className={styles.fieldsList}>
        {/*TODO : warn or make this tab unaccessbile when no model selected*/}
        {Object.keys(scanRule.fields).map((item) => {
          const onResult = (sel:string) => {};
          return (
            <div key={item} className={styles.fieldRow}>
              {/* Field Name */}
              <div>
                <div className={styles.fieldName}>{item}</div>
              </div>
              {
                scanRule.fields[item].map((fieldProp, idx)=>(
                  <div className={styles.selectorWrapper}>
                    <select 
                      className={styles.fieldSelectorType}
                      value={fieldProp.selectorType}
                      onChange={(e) => {
                        const newFieldProps = [...scanRule.fields[item]];
                        newFieldProps[idx] = {...newFieldProps[idx], selectorType: e.target.value as FieldProperties['selectorType']} as FieldProperties;
                        handleFieldsChange(item, newFieldProps);
                      }}
                    >
                      {
                        Object.keys(SELECTOR_TYPES).map(type=>(
                          <option key={type} value={type}>{t(type as keyof typeof SELECTOR_TYPES)}</option>
                        ))
                      }
                    </select>
                    <input
                      className={`${styles.input} ${styles.fieldPropContent}`}
                      value={fieldProp.content}
                      placeholder={fieldProp.selectorType==='literal'? t("content") : t("cssSelector")}
                      onChange={(e) => {
                        const newFieldProps = [...scanRule.fields[item]];
                        newFieldProps[idx] = {...newFieldProps[idx], content: e.target.value} as FieldProperties;
                        handleFieldsChange(item, newFieldProps);
                      }}
                    />
                    {/* CSS Selector + Picker */}
                    <select
                      className={styles.select}
                      value={fieldProp.dataType}
                      onChange={(e) => handleFieldsChange(item, {...scanRule.fields[item] })}
                    >
                    {
                      Object.keys(FIELD_DATA_TYPES).map(type=>(
                        <option key={type} value={type}>{t((type).toLowerCase() as FieldDataType)}</option>
                      ))
                    }
                    </select>
                    <span title={t('removeFieldProp')} onClick={()=>{
                      const newFieldProps = scanRule.fields[item].filter((_, i)=>i!==idx);
                      handleFieldsChange(item, newFieldProps);
                    }}>x</span>
                  </div>
                ))
              } 
              <SimpleButton title="Extract Field Css Selector" src={MagicIcon} onClick={()=>{
                enterInspectionMode(onResult);
              }}/> 
              <SimpleButton title="Add Field Property" text={t('addFieldProp')} onClick={()=>{
                const newFieldProps = [...scanRule.fields[item], {content: '', selectorType: 'css', dataType: 'text'}] as FieldProperties[];
                handleFieldsChange(item, newFieldProps);
              }}/>
            </div>
          );
        })}
      </div>
      {isInspectionMode && <InspectionOverlay mode={INSPECTION_MODE.FIELD_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
    </div>
  );
};

export default ScanRuleFieldEditor;