import { useEffect, useRef, useState } from "react";
import commonStyles from "./common.module.css";
import useContentUI from "./util/useContentUI";
import { useForceUpdate } from "@/panel/hooks/useForceUpdate";

export interface MenuItem {
  key: string;
  onClick: (e:MouseEvent) => void;
  onHover?: (e:MouseEvent) => void;
  onMouseLeave?: (e:React.MouseEvent) => void;
  disable?: boolean;
}
const Menu = () => {
  const {menu} = useContentUI();
  const menuRef = useRef<HTMLDivElement>(null);
  // console.log("menu rendered with items:", menu.items);
  const handleClickOutside= (e:MouseEvent)=>{
    console.log("handleClickOutside called with target:", e.target);
    if(!e.target || !(e.target instanceof HTMLElement)) return;
    if (menuRef.current &&menuRef.current!==e.target&& !menuRef.current.contains(e.target)) {
      console.log("Click outside menu detected, hiding menu.", menu.deClick);
      menu.deClick(e);
    };
  };
  const forceUpdate = useForceUpdate();
  document.addEventListener('scroll', forceUpdate, true);
  document.addEventListener('click', handleClickOutside);
  useEffect(()=>{
    return ()=>{
      document.removeEventListener('scroll', forceUpdate, true);
      document.removeEventListener('click', handleClickOutside);
    };
  },[forceUpdate]);

  // WARN: MAKE SURE RETURN NULL AFTER HOOKS(useRef, useState, useEffect, etc) CALLED IN CONDITIONAL STATEMENT.
  if (!menu.isShowing) return null;
  return <div className={commonStyles.menu} 
    style={{left: menu.x-window.scrollX, top: menu.y-window.scrollY}}
    ref={menuRef}
  >
    <div className={commonStyles.header}>{menu.header}</div>
    {menu.items.map((item, index)=>(
      <button key={index} onMouseOver={(e)=>{
        e.stopPropagation();
        if(item.onHover) item.onHover(e.nativeEvent as MouseEvent);
      }} onClick={(e)=>{
        e.stopPropagation();
        item.onClick(e.nativeEvent as MouseEvent);
      }}
      onMouseLeave={item.onMouseLeave}
      disabled={item.disable}>
        {item.key}
      </button>
    ))}
  </div>;
};
export default Menu;