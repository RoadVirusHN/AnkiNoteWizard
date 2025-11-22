import { Note, Template } from "@/front/utils/useTemplates";
import detectPageStyle from "@/front/pages/Detect/detectPage.module.css";
import commonStyle from "@/front/common.module.css";
import { Extracted } from "../DetectPage";
import DelIcon from "@/public/Icon/Icon-Dump.svg";
import { useNavigate } from "react-router";


interface DetectedCardProps {
  idx: string;
  extracted: Extracted;
  template: Template;
  checkAdd: (val:boolean)=>void;
};

const DetectedCard = ({idx, extracted, template, checkAdd}:DetectedCardProps) => {
   const navigate = useNavigate();
   return (  
    <article className={detectPageStyle.detectedCardContainer} onClick={()=>navigate(`previewCard/${idx}`)}>
      <input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}}/>
      <div className={detectPageStyle.detectedCardContent}>
        <div className={commonStyle.badge} style={{paddingLeft: '2px', paddingRight: '2px'}}>{template.templateName}</div>
        <h3 className={detectPageStyle.front}>{extracted.Front['front']}</h3>
        <p className={detectPageStyle.back}>{extracted.Back['back']}</p>
      </div>
      {/* TODO : Add Del function - make Hash of card and ban it. */}
      <div className={detectPageStyle.delButton} title="Comming Soon!">
        <DelIcon/>
      </div>
    </article>);
};
export default DetectedCard;