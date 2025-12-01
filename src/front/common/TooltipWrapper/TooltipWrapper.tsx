import React, {ReactNode} from 'react';
import tooltipStyle from './tooltip.module.css';
import commonStyle from "@/front/common.module.css";
export enum TooltipDirection{
  TOP = 'tooltip-top',
  BOTTOM  = 'tooltip-bottom',
  LEFT = 'tooltip-left',
  RIGHT = 'tooltip-right',
  UP_LEFT = 'tooltip-up-left',
  UP_RIGHT = 'tooltip-up-right',
  BOTTOM_LEFT = 'tooltip-bottom-left',
  BOTTOM_RIGHT = 'tooltip-bottom-right',
}

interface TooltipWrapperProps {
  children?:ReactNode,
  classes?:string[],
  text:string,
  styles?: React.CSSProperties,
  textStyles?:React.CSSProperties,
  tooltipDirection?: TooltipDirection,
}

const TooltipWrapper = (
  {children, classes, text, textStyles, styles, tooltipDirection=TooltipDirection.TOP}:TooltipWrapperProps
) => {
    // TODO: use clsx later.
    let classNames = `${tooltipStyle.tooltip} ${commonStyle['no-select']}`;
    for (const className of classes || []) { //와.... || [] 이거 똑똑하네
      classNames += ` ${className}`;
    }
    let directionStyle;
    switch (tooltipDirection) {
      case TooltipDirection.BOTTOM:
        directionStyle = tooltipStyle['tooltip-bottom'];
        break;
      case TooltipDirection.LEFT:
        directionStyle = tooltipStyle['tooltip-left'];
        break;
      case TooltipDirection.RIGHT:
        directionStyle = tooltipStyle['tooltip-right'];
        break;
      case TooltipDirection.BOTTOM_LEFT:
        directionStyle = tooltipStyle['tooltip-bottom-left'];  // fix later
        break;
      default:
        directionStyle = tooltipStyle['tooltip-top'];
        break;
    }
  return (
    <div className={classNames} role='tooltip' aria-label={text} style={styles}>
      <span className={`${tooltipStyle.tooltiptext} ${directionStyle}`} style={textStyles}>{text}</span>
      {children}
    </div>
  );
};
export default TooltipWrapper;