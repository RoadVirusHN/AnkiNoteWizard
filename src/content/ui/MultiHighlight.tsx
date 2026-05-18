import commonStyles from "./common.module.css";
import useContentUI from "@/content/ui/util/useContentUI";

const MultiHighlight = () => {
  const {multiHighlight} = useContentUI();
  return <>{multiHighlight.targets.map((target,idx)=>{
    const curRect = target.getBoundingClientRect();
    const rect = {width:curRect.width, height:curRect.height, top:curRect.top, left:curRect.left};
    return (<div
    className={commonStyles.highlight} 
    style={
      {top: rect.top, left: rect.left, width: rect.width, height: rect.height, 
        /* inline styled to force !important style vs web page css. */
        backgroundColor: multiHighlight.backgroundColor + ' !important',
        border: '2px solid'+multiHighlight.borderColor +'!important'
      }}/>)})}</>;
};
export default MultiHighlight;