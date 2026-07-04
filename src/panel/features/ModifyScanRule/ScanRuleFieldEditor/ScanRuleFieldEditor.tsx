import styles from "../modifyScanRule.module.css";

import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import useInspection from "@/panel/hooks/useInspection";
import { ScanRule, FieldProperties, FieldDataType, FIELD_DATA_TYPES, SELECTOR_TYPES } from "@/types/scanRule.types";
import { INSPECTION_MODE } from "@/types/app.types";
import { useTranslation } from "react-i18next";
import FieldPropInput from "./FieldPropInput/FieldPropInput";

interface Props {
  scanRule: ScanRule;
  setData: (data: ScanRule) => void;
}

const ScanRuleFieldEditor = ({ scanRule, setData } : Props) => {
  const {
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
        {Object.keys(scanRule.fields).map((key) => {
          return <FieldPropInput 
            key={key} 
            fieldName={key}
            scanRule={scanRule}
            onChange={handleFieldsChange}
          />;
        })}
      </div>
      {isInspectionMode && <InspectionOverlay mode={INSPECTION_MODE.FIELD_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
    </div>
  );
};

export default ScanRuleFieldEditor;