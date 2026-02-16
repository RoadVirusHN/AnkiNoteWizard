import menuStyles from "./Menu.module.css";


// 클립보드 복사 및 툴팁 표시
const copyToClipboard = (text: string, x: number, y: number) => {

  navigator.clipboard
    .writeText(text)
    .then(() => {
      contentPort?.postMessage({ type: MessageType.SEND_INSPECTION_DATA_FROM_CONTENT, data: text });
      showTooltip(text, x, y);
    })
    .catch((err) => console.error(err));
};
const Menu = ({}) => {
  return <div className={menuStyles.menu}>
    <div className={menuStyles.header}></div>
  </div>;
};
export default Menu;