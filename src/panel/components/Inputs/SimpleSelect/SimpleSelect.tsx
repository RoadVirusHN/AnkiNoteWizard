import { ChangeEvent, JSX, useState } from "react";
import simpleSelectStyle from "./simpleSelect.module.css";
import { useForceUpdate } from "@/panel/hooks/useForceUpdate";

type SimpleSelectOption = {
  key: string;
  val: string;
  isDisabled?: boolean;
};

interface SimpleSelectProps {
  inputId: string;
  label?: string|JSX.Element;
  placeholder?: string;
  defaultValue?: string;
  isEssential?: boolean;
  errorMessage?: string;
  options: SimpleSelectOption[];
  onChange: (e:ChangeEvent<HTMLSelectElement>) => void;
}


const SimpleSelect = ({inputId, label,placeholder,defaultValue,isEssential,errorMessage,options,onChange}:SimpleSelectProps) => {
  //TODO : Responsive design 
  // 1. when options are too many, make the select box scrollable and set a max height
  // 2. when width is too long, make the label and select box stack horizontally.
  const [errorMessageState, setErrorMessageState] = useState(errorMessage);
  return <div className={simpleSelectStyle.formGroup}>
    <label htmlFor={inputId+'-select'}>{isEssential? <span style={{color:'var(--color-danger)'}}>*</span>:null} {label}</label>
    <select id={inputId} name={inputId+'-select'} className={`${simpleSelectStyle.select}`+(errorMessageState ? ` ${simpleSelectStyle.error}`:null)} onChange={onChange} value={defaultValue}
      onBlur={(e)=>{
        if (e.target.value.trim() === ''&&isEssential){
          setErrorMessageState('required');
        }
      }}
    >
      {placeholder  ? <option value="" disabled>{placeholder}</option> : null}
      {options.map(({key,val,isDisabled},idx) => <option key={idx} value={val} disabled={isDisabled}>{key}</option>)}
    </select>
    {errorMessageState ? <span className={simpleSelectStyle.errorMessage}>{errorMessageState}</span> : null}
  </div>;
  }

export default SimpleSelect;