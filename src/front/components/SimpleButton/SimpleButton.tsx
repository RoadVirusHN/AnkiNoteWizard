import { FunctionComponent, SVGAttributes } from 'react';
import simpleButtonStyles from './simpleButton.module.css';
interface ButtonProps {
  text?: string;
  img?: string; 
  Svg?: FunctionComponent<SVGAttributes<SVGElement>>;
  onClick?: () => void;
  overridedStyle?: React.CSSProperties;
}
const SimpleButton = ({text, img,Svg, onClick, overridedStyle}:ButtonProps) => {

  return (<button className={`${simpleButtonStyles['simple-btn']}`} onClick={onClick} style={overridedStyle}>
    {img && <img src={img}/>}{Svg && <Svg/>} {text}
  </button>);
};
export default SimpleButton;