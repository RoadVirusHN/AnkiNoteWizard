import { useEffect, useState } from "react";
import commonStyles from "./common.module.css";
import { isValidElement } from "./App";

interface HighlightRect {
  width: number;
  height: number;
  top: number;
  left: number;
}
const Highlight = ({onClick}: {onClick:(e:MouseEvent)=>void}) => {
  const [rect, setRect] = useState<HighlightRect>({width: 0, height: 0, top: 0, left: 0}); 
  const [isDisplay, setIsDisplay] = useState(true);
  useEffect(()=>{
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!isValidElement(target)) return;
      console.log(`MouseOver: ${target.tagName}, id: ${target.id}, class: ${target.className}`);
      setIsDisplay(true);
      const curRect = target.getBoundingClientRect();
      setRect({width:curRect.width, height:curRect.height, top:curRect.top, left:curRect.left});
    };
    const onMouseOut = () => {
      console.log(`MouseOut`);
      setIsDisplay(false);
    };
    console.log(`Highlight mounted`);
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    document.addEventListener('scroll', onMouseOut, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('mouseover', onMouseOver,true);
      document.removeEventListener('mouseout', onMouseOut, true);
      document.removeEventListener('scroll', onMouseOut, true);
      document.removeEventListener('click', onClick, true);
    }
  },[]);
  return <div 
    className={commonStyles.highlight} 
    style={
      {top: rect.top, left: rect.left, width: rect.width, height: rect.height, 
      display: isDisplay ? 'block' : 'none'}}/>;
};
export default Highlight;