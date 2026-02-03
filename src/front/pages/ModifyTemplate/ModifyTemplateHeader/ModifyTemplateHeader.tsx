import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import modifyTemplateStyle from "../modifyTemplate.module.css";
import previewCardStyle from "@/front/pages/PreviewCard/previewCard.module.css";
import { useNavigate } from "react-router";
import useLocale from "@/front/utils/useLocale";
interface Props {
  title: string;
  isChanged: boolean;
  onSave: () => void;
  onCancle: () => void;
}
const ModifyTemplateHeader = ({title, isChanged, onSave, onCancle}: Props) => {
  const navigate = useNavigate();
  const tl = useLocale('pages.ModifyTemplate.ModifyTemplateHeader');
 return (<div className={modifyTemplateStyle.header}>
    <div className={modifyTemplateStyle.headerLeft}>
      <img src={ReturnIcon} onClick={() => navigate("/templates")} />
      <span className={modifyTemplateStyle.title}>{title}</span>
    </div>
    <div className={previewCardStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
      <img src={CancleIcon} title={tl('Back to Empty')} onClick={onCancle} style={{'cursor': 'pointer', margin:'5px'}}/>
      <img src={SaveIcon} title={tl('Save', 'common')} onClick={onSave} style={{'cursor': 'pointer', margin: '5px'}}/>
    </div>
  </div>);
};
export default ModifyTemplateHeader;