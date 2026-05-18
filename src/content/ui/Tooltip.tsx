import commonStyles from "./common.module.css";
import useContentUI from "./util/useContentUI";

const Tooltip = () => {
  const {tooltip} = useContentUI();
  return <div className={commonStyles["extension-tooltip"]} style={{
    top: tooltip.y + 10,
    left: tooltip.x + 10,
    display: tooltip.isShowing ? 'block' : 'none',
  }}>
    {tooltip.text}
  </div>;
};
export default Tooltip;