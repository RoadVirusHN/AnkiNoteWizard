import ReturnIcon from "@/public/Icon/Icon-Return.svg";
import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import addPageStyle from "./addPage.module.css";
import commonStyle from "@/front/common.module.css";
import InspectionButton from "@/front/common/InspectionButton/InspectionButton";
import Preview from "@/front/common/Preview/Preview";
import { Editor } from "@monaco-editor/react";
import Tags from "@/front/common/Tags/Tags";
import { useNavigate } from "react-router";
import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import ModelInput from "@/front/common/Inputs/ModelInput/ModelInput";
import { useState } from "react";
import useGlobalVarStore from "@/front/utils/useGlobalVarStore";
import { InspectionMode } from "@/scripts/content/tagExtraction";
const AddPage = ({}) => {
  // TODO : templates 혹은 default template를 이용해서 카드를 추가하는 기능
  // 사용자가 기본값을 변경했으면 나갈때 경고창을 띄우는 기능
  const {models, fetchAnki} = useAnkiConnectionStore();
  const {currentAddingNote, setCurrentAddingNote} = useGlobalVarStore();
  const [curNote, setCurNote] = useState({
        templateName: '',
        deckName: '',
        modelName: '',
        fields: {
          Front: '',
          Back: '',
        },
        tags: [],
   });
  const [curModel, setCurModel] = useState(models[0] || '');
  const [isChanged, setIsChanged] = useState(false);
  const [isModifying, setIsModifying] = useState(true);
  const navigate = useNavigate();
  return <div>
    <div className={addPageStyle.header}>
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <img src={ReturnIcon} onClick={()=>{navigate('/')}} style={{'cursor': 'pointer'}}/> 
        <ModelInput defaultModel={models[0]} setModel={setCurModel}/>
      </div>
      <div className={commonStyle.toggle}>
        <div className={addPageStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
          <img src={SaveIcon}  onClick={()=>{
            setIsChanged(false);
            setCurrentAddingNote(curNote);
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
          <img src={AddIcon}  onClick={()=>{
            const req = {
              action: 'addNote',
              params: {
                note: curNote,
              },
            };
            fetchAnki(req).then((res)=>{
                setIsChanged(false);
                setCurNote({
                  templateName: '',
                  deckName: '',
                  modelName: curModel,
                  fields: {
                    Front: '',
                    Back: '',
                  },
                  tags: [],
                });
              });
            }} style={{'cursor': 'pointer', margin:'5px'}}/>
        </div>
        <img src={PreviewIcon} />
        <label className={commonStyle.switch}>
          <input type="checkbox" onChange={(e)=>{
            setIsModifying(e.target.checked);
          }}/>
          <span className={commonStyle.slider} title={isModifying ? "Modify" : "Preview"}/>
        </label>
        <img src={CodeIcon} />
      </div>
    </div>
      {<section className={addPageStyle.previewPage}>
          <Tags givenTags={curNote.tags} isModifying={isModifying} 
          onAddTag={(tag)=>{
            setIsChanged(true);
            setIsChanged(true);
          }} 
          onRemoveTag={(tag)=>{
          }}/>
          <h3>front preview {isModifying ? <InspectionButton mode={InspectionMode.TEXT_EXTRACTION} setResult={()=>{}}/> : ''}</h3>
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
              onMount={(editor)=>{
                editor.onDidFocusEditorText(()=>{
                });
                editor.onDidBlurEditorText(()=>{
                });
              }}
              />) :
              <Preview html={curNote.fields.Front}/>
          }
          <h3>back preview {isModifying ? <InspectionButton mode={InspectionMode.TEXT_EXTRACTION} setResult={()=>{}}/> : ''}</h3>
          {
            isModifying ? 
            (<Editor
              defaultLanguage="html"
              value={curNote.fields.Back}
              width='100%'
              height='200px'
              onChange={(value)=>{
                setCurNote({...curNote, fields: {...curNote.fields, Front: value || ''}});  
                setIsChanged(true);
              }}
              onMount={(editor)=>{
                editor.onDidFocusEditorText(()=>{
                });
                editor.onDidBlurEditorText(()=>{
                });
              }}
              />)
            : <Preview html={curNote.fields.Back}/>
          }
        </section>      
      }
  </div>;
};
export default AddPage;