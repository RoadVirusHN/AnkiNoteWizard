import { FunctionComponent, SVGAttributes } from 'react';
import simpleButtonStyles from './simpleButton.module.css';
interface ButtonProps {
  text?: string;
  src?: string; 
  onClick?: () => void;
  overridedStyle?: React.CSSProperties;
  title?: string;
}
const SimpleButton = ({text, src, onClick, overridedStyle, title}:ButtonProps) => {
  return (<button className={`${simpleButtonStyles['simple-btn']}`} onClick={onClick} style={overridedStyle} title={title}>
    {src && <img src={src}/>} {text}
  </button>);
};  
export default SimpleButton;