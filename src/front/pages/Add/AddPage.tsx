import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import addPageStyle from "./addPage.module.css";
import commonStyle from "@/front/common.module.css";
import InspectionOverlay from "@/front/common/InspectionOverlay/InspectionOverlay";
import Preview from "@/front/common/Preview/Preview";
import { Editor } from "@monaco-editor/react";
import Tags from "@/front/common/Tags/Tags";
import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import ModelInput from "@/front/common/Inputs/ModelInput/ModelInput";
import { useState } from "react";
import useGlobalVarStore from "@/front/utils/useGlobalVarStore";
import { InspectionMode } from "@/scripts/content/tagExtraction_bak";
import SimpleButton from "@/front/common/SimpleButton/SimpleButton";
import TemplateInput from "@/front/common/Inputs/TemplatInput/TemplateInput";
import DeckInput from "@/front/common/StatusBar/DeckInput/DeckInput";
import useLocale from "@/front/utils/useLocale";
import Icon from "@/front/common/Icon/Icon";
import useConfigure, { Theme } from "@/front/utils/useConfigure";
import useInspection from "@/front/utils/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";

const AddPage = ({}) => {
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentAddingNote, setCurrentAddingNote} = useGlobalVarStore();
  const [curNote, setCurNote] = useState(currentAddingNote);
  const [isChanged, setIsChanged] = useState(false);
  const [isModifying, setIsModifying] = useState(true);
  const tl = useLocale('pages.AddPage');
  const tlC = useLocale('common');
  const {themeOption} = useConfigure();
  const {enterInspectionMode,cancleInspectionMode,isInspectionMode} = useInspection();
  return <div>
    <div className={addPageStyle.header}>     
      <h2>{tl('Add Note to Anki')}</h2>
      <div className={commonStyle.toggle}>
        <div className={addPageStyle.modBtns} style={{visibility: isChanged ? "visible" : "hidden"}}>
          <Icon url={CancleIcon} handleClick={()=>{
            setIsChanged(false);
            setCurNote(currentAddingNote);
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
          <Icon url={SaveIcon} handleClick={()=>{
            setIsChanged(false);
            setCurrentAddingNote(curNote);
          }} style={{'cursor': 'pointer', margin: '5px'}}/>
        </div>
        <Icon url={PreviewIcon}/>
        <label className={commonStyle.switch}>
          <input type="checkbox" onChange={(e)=>{
            setIsModifying(e.target.checked);
          }} checked={isModifying}/>
          <span className={commonStyle.slider} title={tlC(isModifying ? "modify" : "preview")}/>
        </label>
        <Icon url={CodeIcon}/>
      </div>
    </div>
      {<section className={addPageStyle.previewPage}>
        <InspectionOverlay mode={InspectionMode.TEXT_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>
        <DeckInput onChange={(deck:string)=>{setCurNote({...curNote, deckName: deck})}}/>
        <TemplateInput defaultTemplate={curNote.templateName} setTemplate={(template:string)=>{
          setCurNote({...curNote, templateName: template});
          setIsChanged(true);
        }}/>
        <ModelInput defaultModel={curNote.modelName} setModel={(model:string)=>{
          setCurNote({...curNote, modelName: model});
          setIsChanged(true);
        }}/>
        <Tags givenTags={curNote.tags} isModifying={isModifying} 
        onAddTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tags: [...curNote.tags, tag]});
        }} 
        onRemoveTag={(tag)=>{
          setIsChanged(true);
          setCurNote({...curNote, tags: curNote.tags.filter(t=>t!==tag)});
        }}/>
        <h3>{tlC('front') +' '+tlC('preview')} {isModifying ?? <SimpleButton title="Extract Field Css Selector" src={MagicIcon} onClick={()=>enterInspectionMode()}/> }</h3>
        {
          isModifying ?
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Front}
            width='100%'
            height='200px'
            theme={themeOption.theme === Theme.DARK ? "vs-dark" : "light"}
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
        <h3>{tlC('back') +' ' + tlC('preview')} {isModifying ?? <SimpleButton title="Extract Field Css Selector" src={MagicIcon} onClick={()=>enterInspectionMode()}/>}</h3>
        {
          isModifying ? 
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Back}
            width='100%'
            height='200px'
            theme={themeOption.theme === Theme.DARK ? "vs-dark" : "light"}
            onChange={(value)=>{
              setCurNote({...curNote, fields: {...curNote.fields, Back: value || ''}});  
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
      </section> }
      <SimpleButton src={AddIcon} 
        onClick={()=>{
          const req = {
            action: 'addNote',
            params: {
              note: curNote
            },
          };
          fetchAnki(req).then((res)=>{
            setIsChanged(false);
            setCurNote(currentAddingNote);
            alert(res.error ? tlC('error')+`: ${res.error}` : tl('Note added successfully'));
            });
          }}
        text={tl('Add Note')}
      />
  </div>;
};
export default AddPage;