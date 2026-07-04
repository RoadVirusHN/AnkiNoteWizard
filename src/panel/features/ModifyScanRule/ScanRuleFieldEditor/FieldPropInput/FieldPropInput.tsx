import { FIELD_DATA_TYPES, FieldDataType, FieldProperties, ScanRule, SELECTOR_TYPES } from "@/types/scanRule.types";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import CancleIcon from "@/public/Icon/Icon-Dump.svg";
import { useTranslation } from "react-i18next";
import modifyScanRuleStyles from "../../modifyScanRule.module.css";
import useInspection from "@/panel/hooks/useInspection";
import { INSPECTION_MODE } from "@/types/app.types";

interface Props {
  fieldName: string;
  scanRule: ScanRule;
  onChange: (fieldName:string, newData: FieldProperties[]) => void;
}


const FieldPropInput = ({fieldName, scanRule, onChange}:Props) => {
  const {t} = useTranslation('components', {keyPrefix: 'fieldPropInput'});
  const {
    enterInspectionMode,
  } = useInspection(INSPECTION_MODE.FIELD_EXTRACTION, scanRule.rootTagSelector);

  const onResult = (result: string) => {

  };

  return (<div className={modifyScanRuleStyles.fieldRow}>
    <div className={modifyScanRuleStyles.fieldName}>{fieldName}</div>
    <div className={modifyScanRuleStyles.fieldPropsInput}>
    {
      scanRule.fields[fieldName].map((fieldProp, idx)=>{
        const onResult = (result: string) => {
          if (fieldProp.selectorType === 'css') {
            const newFieldProps = [...scanRule.fields[fieldName]];
            newFieldProps[idx] = {...newFieldProps[idx], content: result} as FieldProperties;
            onChange(fieldName, newFieldProps);
          }
        };
        return <div className={modifyScanRuleStyles.fieldPropsWrapper}>
          <select 
            id={`fieldPropSelectorType-${fieldName}-${idx}`}
            className={modifyScanRuleStyles.fieldSelectorType}
            value={fieldProp.selectorType}
            onChange={(e) => {
              const newFieldProps = [...scanRule.fields[fieldName]];
              newFieldProps[idx] = {...newFieldProps[idx], selectorType: e.target.value as FieldProperties['selectorType']} as FieldProperties;
              onChange(fieldName, newFieldProps);
            }}
            >
            {
              Object.keys(SELECTOR_TYPES).map(type=>(
                <option key={type} value={type}>{t(type as keyof typeof SELECTOR_TYPES)}</option>
              ))
            }
          </select>
          <input
            id={`fieldPropContent-${fieldName}-${idx}`}
            className={`${modifyScanRuleStyles.input} ${modifyScanRuleStyles.fieldPropContent}`}
            value={fieldProp.content}
            placeholder={fieldProp.selectorType==='literal'? t("content") : t("cssSelector")}
            onChange={(e) => {
              const newFieldProps = [...scanRule.fields[fieldName]];
              newFieldProps[idx] = {...newFieldProps[idx], content: e.target.value} as FieldProperties;
              onChange(fieldName, newFieldProps);
            }}
            />
          {/* CSS Selector + Picker */}
          <select
            id={`fieldPropDataType-${fieldName}-${idx}`}
            className={modifyScanRuleStyles.select}
            value={fieldProp.dataType}
            onChange={(e) => onChange(fieldName, {...scanRule.fields[fieldName] })}
            >
          {
            Object.keys(FIELD_DATA_TYPES).map(type=>(
              <option key={type} value={type}>{t((type).toLowerCase() as FieldDataType)}</option>
            ))
          }
          </select>
          <img title={t("extractContent")} src={MagicIcon} onClick={()=>{
            enterInspectionMode(onResult);
          }}/> 
          <img title={t('removeFieldProp')} src={CancleIcon} onClick={()=>{
            const newFieldProps = scanRule.fields[fieldName].filter((_, i)=>i!==idx);
            onChange(fieldName, newFieldProps);
          }}/>
        </div>
      })
    } 
    
    <img title={t('addFieldProp')} src={AddIcon} onClick={()=>{
      const newFieldProps = [...scanRule.fields[fieldName], {content: '', selectorType: 'css', dataType: 'text'}] as FieldProperties[];
      onChange(fieldName, newFieldProps);
    }}/>
    </div>
  </div>);
};
export default FieldPropInput;