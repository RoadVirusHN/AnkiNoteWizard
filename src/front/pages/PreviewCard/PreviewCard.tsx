import useTemplate from "@/front/utils/useTemplates";
import previewCardStyle from "./previewCard.module.css";
import commonStyle from "@/front/common.module.css";
import { useNavigate, useParams } from "react-router";
import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import { useState } from "react";
import Tags from "@/front/components/Tags/Tags";

const PreviewCard = ({}) => {
  const {index} = useParams();
  const [isModifying, setIsModifying] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const {notes, templates, updateNote} = useTemplate();
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
        <div className={previewCardStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
          <CancleIcon/>
          <SaveIcon/>
        </div>
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
    {
      isModifying ? 
        (<div>

        </div>) 
        : (
          <section className={previewCardStyle.previewPage}>
            <Tags givenTags={notes[idx].tags} isModifying={true} 
            onAddTag={(tag)=>{
              updateNote(idx, {tags: [...notes[idx].tags, tag]});
            }} 
            onRemoveTag={(tag)=>{
              updateNote(idx, {tags: notes[idx].tags.filter(t=>t!==tag)});
            }}/>
            <h3>front preview</h3>
            <div className={previewCardStyle.previewWrapper}>
              <div 
              style={{ transform: 'scale(0.85)', width: '100%' }}
              dangerouslySetInnerHTML={{__html: notes[idx].fields.Front}} 
              />
            </div>            
            <h3>back preview</h3>
            <div className={previewCardStyle.previewWrapper}>
              <div 
              style={{ transform: 'scale(0.85)', width: '100%' }}
              dangerouslySetInnerHTML={{__html: notes[idx].fields.Back}} 
              />
            </div>
          </section>
        )
    }
  </div>);
};
export default PreviewCard;