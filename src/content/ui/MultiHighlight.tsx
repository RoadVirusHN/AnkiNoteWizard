import commonStyles from "./common.module.css";
import useContentUI from "@/content/ui/util/useContentUI";

const MultiHighlight = () => {
  const {multiHighlight} = useContentUI();
  // WARN: MAKE SURE RETURN NULL AFTER HOOKS(useRef, useState, useEffect, etc) CALLED IN CONDITIONAL STATEMENT.
  if (multiHighlight.targets.length==0) return null;
  console.log("MultiHighlight rendered with targets:", multiHighlight.targets);
  return <>{multiHighlight.targets.map((target,idx)=>{
    const curRect = target.getBoundingClientRect();
    const rect = {width:curRect.width, height:curRect.height, top:curRect.top, left:curRect.left};
    return (<div
    key={idx}
    className={commonStyles.highlight} 
    style={
      {top: rect.top, left: rect.left, width: rect.width, height: rect.height, 
        /* inline styled to force !important style vs web page css. */
        backgroundColor: multiHighlight.backgroundColor + ' !important',
        border: '2px solid '+multiHighlight.borderColor +' !important'
      }}/>)})}</>;
};
export default MultiHighlight;