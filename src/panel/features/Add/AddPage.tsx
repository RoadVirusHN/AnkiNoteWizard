import PreviewIcon from "@/public/Icon/Icon-Preview.svg";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import CancleIcon from "@/public/Icon/Icon-Reset.svg";
import SaveIcon from "@/public/Icon/Icon-Save.svg";
import CodeIcon from "@/public/Icon/Icon-Code.svg";
import addPageStyle from "./addPage.module.css";
import commonStyle from "@/panel/common.module.css";
import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import Preview from "@/panel/components/Preview/Preview";
import { Editor } from "@monaco-editor/react";
import Tags from "@/panel/components/Tags/Tags";
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import ModelInput from "@/panel/components/Inputs/ModelInput/ModelInput";
import { useState } from "react";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import SimpleButton from "@/panel/components/SimpleButton/SimpleButton";
import ScanRuleInput from "@/panel/components/Inputs/TemplatInput/ScanRuleInput";
import DeckInput from "@/panel/components/StatusBar/DeckInput/DeckInput";
import useLocale from "@/panel/hooks/useLocale";
import Icon from "@/panel/components/Icon/Icon";
import useConfigure from "@/panel/stores/useConfigure";
import useInspection from "@/panel/hooks/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import { NavLink } from "react-router";
import { INSPECTION_MODE, THEME } from "@/types/app.types";

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
      <NavLink to="/errorTesting/runtime">go to Error page</NavLink>
    </div>
      {<section className={addPageStyle.previewPage}>
        {isInspectionMode ?? <InspectionOverlay mode={INSPECTION_MODE.TEXT_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
        <DeckInput onChange={(deck:string)=>{setCurNote({...curNote, deckName: deck})}}/>
        <ScanRuleInput defaultScanRule={curNote.scanRuleName} setScanRule={(scanRule:string)=>{
          setCurNote({...curNote, scanRuleName: scanRule});
          setIsChanged(true);
        }}/>
        <ModelInput defaultModel={curNote.modelId} setModel={(model:string)=>{
          setCurNote({...curNote, modelId: model});
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
            theme={themeOption.theme === THEME.DARK ? "vs-dark" : "light"}
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
            <Preview html={curNote.fields.Front} modelName={curNote.modelId}/>
        }
        <h3>{tlC('back') +' ' + tlC('preview')} {isModifying ?? <SimpleButton title="Extract Field Css Selector" src={MagicIcon} onClick={()=>enterInspectionMode()}/>}</h3>
        {
          isModifying ? 
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Back}
            width='100%'
            height='200px'
            theme={themeOption.theme === THEME.DARK ? "vs-dark" : "light"}
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
          : <Preview html={curNote.fields.Back} modelName={curNote.modelId}/>
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