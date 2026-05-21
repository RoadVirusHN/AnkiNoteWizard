import commonStyles from "./common.module.css";
import useContentUI from "./util/useContentUI";

const Tooltip = () => {
  const {tooltip} = useContentUI();
  // WARN: MAKE SURE RETURN NULL AFTER HOOKS(useRef, useState, useEffect, etc) CALLED IN CONDITIONAL STATEMENT.
  if (!tooltip.isShowing) return null;
  return <div className={commonStyles["extension-tooltip"]} style={{
    top: tooltip.y + 10,
    left: tooltip.x + 10
  }}>
    {tooltip.text}
  </div>;
};
export default Tooltip;