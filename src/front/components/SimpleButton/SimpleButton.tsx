import { FunctionComponent, ReactNode, SVGAttributes, useState } from 'react';
import simpleButtonStyles from './simpleButton.module.css';
interface ButtonProps {
  text: string;
  img?: string; 
  svg?: FunctionComponent<SVGAttributes<SVGElement>>;
  onClick?: () => void;
  overridedStyle?: React.CSSProperties;
}
const SimpleButton = ({text, img,svg, onClick, overridedStyle}:ButtonProps) => {

  return (<button className={`${simpleButtonStyles['simple-btn']}`} onClick={onClick} style={overridedStyle}>
    {img && <img src={img}/>}
    {svg && ((svg as unknown) as ReactNode)}
    {text}
  </button>);
};
export default SimpleButton;