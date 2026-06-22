import { ChangeEvent, JSX, useState } from "react";
import simpleInputStyle from "./simpleInput.module.css";


interface SimpleInputProps {
  inputId: string;
  label?: string|JSX.Element;
  placeholder?: string;
  defaultValue?: string;
  isEssential?: boolean;
  errorMessage?: string;
  onChange: (e:ChangeEvent<HTMLInputElement>) => void;
}


const SimpleInput = ({inputId, label,placeholder,defaultValue,isEssential,errorMessage,onChange}:SimpleInputProps) => {
  //TODO : Responsive design 
  // 1. when width is too long, make the label and select box stack horizontally.
  const [errorMessageState, setErrorMessageState] = useState(errorMessage);
  return <div className={simpleInputStyle.formGroup}>
    <label htmlFor={inputId+'-input'}>{isEssential? <span style={{color:'var(--color-danger)'}}>*</span>:null} {label}</label>
    <input id={inputId+'-input'} name={inputId+'-input'} className={`${simpleInputStyle.input}`+ (errorMessageState? ` ${simpleInputStyle.error}` : '')} placeholder={placeholder} onChange={onChange} value={defaultValue}
      onBlur={(e)=>{
        if (e.target.value.trim() === ''&&isEssential){
          setErrorMessageState('required');
        }
      }}
    />
    {errorMessageState ? <span className={simpleInputStyle.errorMessage}>{errorMessageState}</span> : null}
  </div>;
  }

export default SimpleInput;