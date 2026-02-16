import commonStyles from "./common.module.css";
const Tooltip = ({text, x,y,showingTooltip}:{text:string, x:number,y:number,showingTooltip:boolean}) => {
  console.log("isShowingTooltip", showingTooltip);
  return <div className={commonStyles["extension-tooltip"]} style={{
    top: y + 10,
    left: x + 10,
    display: showingTooltip ? 'block' : 'none'
  }}>
    {text}
  </div>;
};
export default Tooltip;