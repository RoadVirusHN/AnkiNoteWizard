import { useEffect, useState } from "react";
import commonStyles from "./common.module.css";
import { isValidElement } from "../function";
import useContentUI from "./util/useContentUI";

interface HighlightRect {
  width: number;
  height: number;
  top: number;
  left: number;
}
const TagHighlight = () => {
  const {tagHighlight} = useContentUI();
  const [rect, setRect] = useState<HighlightRect>({width: 0, height: 0, top: 0, left: 0}); 

  useEffect(()=>{
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!isValidElement(target)) return;
      const curRect = target.getBoundingClientRect();
      setRect({width:curRect.width, height:curRect.height, top:curRect.top, left:curRect.left});
    };
    // const onMouseOut = () => {
    //   setIsDisplay(false);
    // };

    document.addEventListener('mouseover', onMouseOver, true);
    //document.addEventListener('mouseout', onMouseOut, true);
    //document.addEventListener('scroll', onMouseOut, true);
    document.addEventListener('click', tagHighlight.onClick, true);
    return () => {
      document.removeEventListener('mouseover', onMouseOver,true);
      //document.removeEventListener('mouseout', onMouseOut, true);
      //document.removeEventListener('scroll', onMouseOut, true);
      document.removeEventListener('click', tagHighlight.onClick, true);
    }
  },[]);
  return <div
    className={commonStyles.highlight} 
    style={
      {top: rect.top, left: rect.left, width: rect.width, height: rect.height, 
      display: tagHighlight.isShowing ? 'block' : 'none',
      /* inline styled to force !important style vs web page css. */
      backgroundColor: tagHighlight.backgroundColor + ' !important',
       border: '2px solid'+tagHighlight.borderColor +'!important'
    }}/>;
};
export default TagHighlight;