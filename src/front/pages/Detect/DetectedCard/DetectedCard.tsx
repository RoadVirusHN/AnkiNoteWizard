import useTemplate, { Extracted, Note, Template } from "@/front/utils/useTemplates";
import detectPageStyle from "@/front/pages/Detect/detectPage.module.css";
import commonStyle from "@/front/common.module.css";

import DelIcon from "@/public/Icon/Icon-Dump.svg";
import { useNavigate } from "react-router";
import { getComplementaryColor } from "@/front/utils/functions";


interface DetectedCardProps {
  idx: string;
  extracted: Extracted;
  template: Template;
  checkAdd: (val:boolean)=>void;
};

const DetectedCard = ({idx, extracted, template, checkAdd}:DetectedCardProps) => {
   const navigate = useNavigate();
   const {notes, tags, removeNote} = useTemplate();
   return (  
    <article className={detectPageStyle.detectedCardContainer} onClick={()=>{navigate(`/previewCard/${idx}`)}}>
      <input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}} onClick={e=>e.stopPropagation()}/>
      <div className={detectPageStyle.detectedCardContent}>
        <div>
          <span className={detectPageStyle.templateName} >{template.templateName}</span>
          {notes[idx].tags.map((tag)=><span className={commonStyle.badge} style={{backgroundColor: tags[tag].color, color: getComplementaryColor(tags[tag].color)}}>{tag}</span>)}
        </div>
        <h3 className={detectPageStyle.front}>{extracted.Front['front']}</h3>
        <p className={detectPageStyle.back}>{extracted.Back['back']}</p>
      </div>
      {/* TODO : Add Del function - make Hash of card and ban it. */}
      <div className={detectPageStyle.delButton}>
        <DelIcon onClick={(e)=>{
          e.stopPropagation();
          removeNote(idx);
        }} style={{cursor: 'pointer'}}/>
      </div>
    </article>);
};
export default DetectedCard;