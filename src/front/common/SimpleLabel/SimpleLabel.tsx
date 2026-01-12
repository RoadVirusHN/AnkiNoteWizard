import React from "react";
import simpleLabelStyle from './simpleLabel.module.css';
interface Props{
  forWho: string;
  text?: string;
  overridedStyle?: React.CSSProperties;
  child?: React.ReactNode;
}

const SimpleLabel = ({forWho, text, overridedStyle, child}:Props) => {
  return <label className={simpleLabelStyle.label} htmlFor={forWho} style={overridedStyle}>
    {child} {text}
  </label>
};
export default SimpleLabel;