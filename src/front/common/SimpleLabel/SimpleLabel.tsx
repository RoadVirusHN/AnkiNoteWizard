import React from "react";

interface Props{
  forWho: string;
  text: string;
  overridedStyle?: React.CSSProperties;
}

const SimpleLabel = ({forWho, text, overridedStyle}:Props) => {
  return <label htmlFor={forWho} style={overridedStyle}>
    {text}
  </label>
};
export default SimpleLabel;