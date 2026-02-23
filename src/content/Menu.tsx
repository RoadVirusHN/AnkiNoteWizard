import { useEffect, useRef, useState } from "react";
import commonStyles from "./common.module.css";

export interface MenuItem {
  key: string;
  onClick: (e:MouseEvent) => void;
}
interface MenuProps {
  items: MenuItem[];
  header: string;
  deClick:() => void;
  pos: {x:number, y:number};
}

const Menu = ({items, deClick, header, pos}:MenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const handleClickOutside= (e:MouseEvent)=>{
      if(!e.target || !(e.target instanceof HTMLElement)) return;
      if (menuRef.current &&menuRef.current!==e.target&& !menuRef.current.contains(e.target)) {
        deClick();
      };
    };
    document.addEventListener('click', handleClickOutside);
    return ()=>{
      document.removeEventListener('click', handleClickOutside);
    };
  },[]);
  return <div className={commonStyles.menu} 
    style={{top: pos.x, left: pos.y}}
    ref={menuRef}
  >
    <div className={commonStyles.header}>{header}</div>
    {items.map((item, index)=>(
      <button key={index} onClick={(e)=>{
        e.stopPropagation();
        item.onClick(e.nativeEvent as MouseEvent);
      }}>
        {item.key}
      </button>
    ))}
  </div>;
};
export default Menu;