import { useEffect, useState } from "react";
import highlightStyles from "./Highlight.module.css";
import { isValidElement } from "./App";

const Highlight = ({onClick}: {onClick:()=>void}) => {
  const [rect, setRect] = useState<DOMRect | null>(null); 
  const [isDisplay, setIsDisplay] = useState(false);
  useEffect(()=>{
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!isValidElement(target)) return;
      setIsDisplay(true);
      setRect(target.getBoundingClientRect());
    };
    const onMouseOut = (e: MouseEvent) => {
      setIsDisplay(false);
    };
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    }
  },[]);
  return <div 
    className={highlightStyles.highlight} 
    style={
      {top: rect?.top, left: rect?.left, width: rect?.width, height: rect?.height, 
      display: isDisplay ? 'block' : 'none'}}/>;
};
export default Highlight;