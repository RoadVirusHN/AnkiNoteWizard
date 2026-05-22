import { useEffect, useState } from "react";
import commonStyles from "./common.module.css";
import useContentUI from "@/content/ui/util/useContentUI";
import { useForceUpdate } from "@/panel/hooks/useForceUpdate";

const MultiHighlight = () => {
  const {multiHighlight} = useContentUI();
  console.log("MultiHighlight rendered with targets:", multiHighlight.targets);
  const forceUpdate = useForceUpdate();
  document.addEventListener('scroll', forceUpdate, true);
  useEffect(()=>{
    return () => {
      document.removeEventListener('scroll', forceUpdate, true);
    };
  },[forceUpdate]);
  // WARN: MAKE SURE RETURN NULL AFTER HOOKS(useRef, useState, useEffect, etc) CALLED IN CONDITIONAL STATEMENT.
  if (multiHighlight.targets.length==0) return null;
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