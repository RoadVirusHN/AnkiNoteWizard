import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import modifyScanRuleStyle from "../modifyScanRule.module.css";
import { useNavigate } from "react-router";
import Icon from "@/panel/components/Icon/Icon";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  isChanged: boolean;
  onSave: () => void;
  onCancle: () => void;
}
const ModifyScanRuleHeader = ({title, isChanged, onSave, onCancle}: Props) => {
  const navigate = useNavigate();
  // const {t} = useTranslation('page', {keyPrefix: 'modifyScanRule.modifyScanRuleHeader'});
 return (<div className={modifyScanRuleStyle.header}>
    <div className={modifyScanRuleStyle.headerLeft}>
      <img src={ReturnIcon} onClick={() => navigate("/scanRules")} />
      <span className={modifyScanRuleStyle.title}>{title}</span>
    </div>
    <div className={modifyScanRuleStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
      <Icon url={CancleIcon} handleClick={onCancle} style={{'cursor': 'pointer', margin: '5px'}}/>
      <Icon url={SaveIcon} handleClick={onSave} style={{'cursor': 'pointer', margin: '5px'}}/>
    </div>
  </div>);
};
export default ModifyScanRuleHeader;