import useTemplate from "@/front/utils/useTemplates";
import previewCardStyle from "./previewCard.module.css";
import commonStyle from "@/front/common.module.css";
import { useNavigate, useParams } from "react-router";
import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import ExtractIcon from "@/public/Icon/Icon-Code.svg"
import { useState } from "react";
import Tags from "@/front/components/Tags/Tags";
import { Editor } from "@monaco-editor/react";
import SimpleButton from "@/front/components/SimpleButton/SimpleButton";
import { MessageType } from "@/scripts/background/messages";

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
            }} style={{'cursor': 'pointer', margin:'5px'}}/>
          <SaveIcon  onClick={()=>{
            updateNote(idx,{...curNote});
            setIsChanged(false);
            }} style={{'cursor': 'pointer', margin: '5px'}}/>
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
        <div style={{display: 'flex', margin: '5px'}}>
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
        </div>
        <h3>front preview{isModifying ? <SimpleButton Svg={ExtractIcon} onClick={async ()=>{
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab.id) {
            console.warn('No active tab found!');
            return;
          }
          chrome.tabs.sendMessage(tab.id, {
            type: MessageType.ENTER_OVERLAY_MODE
          });
        }}/> : ''}</h3>
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
            style={{ transform: 'scale(0.85)', width: '100%', minHeight: '20%' }}
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