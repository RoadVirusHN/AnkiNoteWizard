import styles from "../modifyScanRule.module.css";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import useInspection from "@/panel/hooks/useInspection";
import { ScanRule, FieldProperties, FieldDataType, FIELD_DATA_TYPES } from "@/types/scanRule.types";
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

  const handleItemChange = (fieldName:string, newData: FieldProperties) => {
    const newItems = {...scanRule.fields};
    newItems[fieldName] = newData;
    setData({ ...scanRule, fields: newItems });
  };
  const {t} = useTranslation('page', {keyPrefix: 'modifyScanRule.scanRuleFieldEditor'});
  
  // TODO : 예시 화면 추가 (ex. selector에 따라 추출되는 데이터 미리보기) 
  // TODO : Field 별로 여러 selector 등록 기능 (ex. title 필드의 경우 제목이 여러개일 수 있어서 우선순위에 따라 여러 selector 등록 가능하게)
  // TODO : Field 우선순위 기능
  // TODO : XPath, JavaScript Selector 등 다양한 selector 지원
  return (
    <div className={styles.editorContainer}>
      <div className={styles.fieldHeader}>
        <div className={styles.sectionTitle} style={{marginBottom:0}}>{t('fields')}</div>
      </div>
      
      <div className={styles.fieldsList}>
        {Object.keys(scanRule.fields).map((item) => {
          const onResult = (sel:string) => handleItemChange(item,{...scanRule.fields[item], selector:sel});
          return (
            <div key={item} className={styles.fieldRow}>
              {/* Field Name */}
              <div>
                <div className={styles.fieldName}>{item}</div>
              </div>
              
              {/* CSS Selector + Picker */}
              <div className={styles.selectorWrapper}>
                <input
                  className={`${styles.input} ${styles.fieldSelector}`}
                  value={scanRule.fields[item].selector}
                  placeholder={t("cssSelector")}
                  onChange={(e) => handleItemChange(item, {...scanRule.fields[item], selector: e.target.value})}
                />
                <SimpleButton title="Extract Field Css Selector" src={MagicIcon} onClick={()=>{
                  enterInspectionMode(onResult);
                  }}/> 
              </div>
              <select
                className={styles.select}
                value={scanRule.fields[item].dataType}
                onChange={(e) => handleItemChange(item, {...scanRule.fields[item], dataType: e.target.value as FieldDataType})}
              >
                {
                  Object.keys(FIELD_DATA_TYPES).map(type=>(
                    <option key={type} value={type}>{t((type).toLowerCase() as FieldDataType)}</option>
                  ))
                }
              </select>
            </div>
          );
        })}
      </div>
      {isInspectionMode && <InspectionOverlay mode={INSPECTION_MODE.FIELD_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
    </div>
  );
};

export default ScanRuleFieldEditor;