import { ButtonHTMLAttributes, FunctionComponent, SVGAttributes } from 'react';
import simpleButtonStyles from './simpleButton.module.css';
import Icon from '../Icon/Icon';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
  text?: string;
  src?: string; 
}
const SimpleButton = ({text, src, className, children, ...props}:ButtonProps) => {
  return (<button 
    className={`${simpleButtonStyles['simple-btn']} ${className||''}`} 
    {...props}>
    {src && <Icon url={src}/>} {text} {children}
  </button>);
};  
export default SimpleButton;