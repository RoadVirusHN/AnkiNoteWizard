import useTemplate from "@/front/utils/useTemplates";
import previewCardStyle from "./previewCard.module.css";
import commonStyle from "@/front/common.module.css";
import { useNavigate, useParams } from "react-router";
import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import { useState } from "react";

const PreviewCard = ({}) => {
  const {index} = useParams();
  const [isModifying, setIsModifying] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const {notes, templates} = useTemplate();
  const idx = index ?? '0-0';
  const templateIdx = Number(idx.split('-')[0]);
  const navigate = useNavigate();
  return (<div>
    <div className={previewCardStyle.header}>
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <ReturnIcon onClick={()=>{navigate('/')}} style={{'cursor': 'pointer'}}/> 
        <h2>{templates[templateIdx].templateName}</h2>
      </div>
      <div className={commonStyle.toggle}>
        <PreviewIcon />
        <label className={commonStyle.switch}>
          <input type="checkbox" onChange={(e)=>{
            setIsModifying(e.target.checked);
            }}/>
          <span className={commonStyle.slider} title={isModifying ? "Modify" : "Preview"}/>
        </label>
        <CodeIcon />
      </div>
    </div>
    {index}
    {notes[idx].fields.Front}
  </div>);
};
export default PreviewCard;