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
import { Editor } from "@monaco-editor/react";

const PreviewCard = ({}) => {
  const {index} = useParams();
  const [isModifying, setIsModifying] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const {notes, templates, updateNote} = useTemplate();
  const idx = index ?? '0-0';
  const [curNote, setCurNote] = useState(notes[idx]);
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
          <CancleIcon  onClick={()=>{
            setCurNote(notes[idx]);
            setIsChanged(false);
            }} style={{'cursor': 'pointer'}}/>
          <SaveIcon  onClick={()=>{
            console.log(isChanged);
            updateNote(idx,{...curNote});
            setIsChanged(false);
            console.log(isChanged);
            }} style={{'cursor': 'pointer'}}/>
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
      <section className={previewCardStyle.previewPage}>
        <h2 style={{margin: '0'}}> {curNote.modelName}</h2>
        <Tags givenTags={curNote.tags} isModifying={isModifying} 
        onAddTag={(tag)=>{
          setCurNote({...curNote, tags: [...curNote.tags, tag]});
          setIsChanged(true);
        }} 
        onRemoveTag={(tag)=>{
          setCurNote({...curNote, tags: curNote.tags.filter(t=>t!==tag)});
          setIsChanged(true);
        }}/>
        <h3>front preview</h3>
        {
          isModifying ?
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Front}
            width='100%'
            height='200px'
            onChange={(value)=>{
              setCurNote({...curNote, fields: {...curNote.fields, Front: value || ''}}); 
              setIsChanged(true);
            }}
            />) :
          <div className={previewCardStyle.previewWrapper}>
            <div 
            style={{ transform: 'scale(0.85)', width: '100%' }}
            dangerouslySetInnerHTML={{__html: curNote.fields.Front}} 
            />
          </div>            
        }
        <h3>back preview</h3>
        {
          isModifying ? 
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Back}
            width='100%'
            height='200px'
            onChange={(value)=>{
              setCurNote({...curNote, fields: {...curNote.fields, Back: value || ''}}); 
              setIsChanged(true);
            }}
            />)
          :
          (<div className={previewCardStyle.previewWrapper}>
          <div 
          style={{ transform: 'scale(0.85)', width: '100%' }}
          dangerouslySetInnerHTML={{__html: curNote.fields.Back}} 
          />
          </div>)
        }
      </section>      
    }
  </div>);
};
export default PreviewCard;