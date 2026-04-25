import useScanRule from "@/panel/stores/useScanRule";
import previewCardStyle from "./previewCard.module.css";
import { useParams } from "react-router";
import { useState } from "react";
import Tags from "@/panel/components/Tags/Tags";
import { Editor } from "@monaco-editor/react";
import InspectionOverlay from "@/panel/components/InspectionOverlay/InspectionOverlay";
import Preview from "@/panel/components/Preview/Preview";
import PreviewHeader from "./PreviewHeader/PreviewHeader";
import { PreviewContext } from "./PreviewContext";
import ModelInput from "@/panel/components/Inputs/ModelInput/ModelInput";
import useConfigure from "@/panel/stores/useConfigure";
import useInspection from "@/panel/hooks/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import SimpleButton from "@/panel/components/SimpleButton/SimpleButton";
import { INSPECTION_MODE, THEME } from "@/types/app.types";

const PreviewCard = ({}) => {
  const {index} = useParams();
  const idx = index ?? '0-0';
  const {notes} = useScanRule();
  const [contextValue, setContextValue] = useState({isChanged: false, isModifying : false,curNote: notes[idx], idx});
  const {curNote, isModifying, isChanged} = contextValue; 
  const [curText, setCurText] = useState('');
  const {themeOption} = useConfigure();
  const onResult = (text:string) => setCurText(text);
  const {enterInspectionMode,cancleInspectionMode,isInspectionMode} = useInspection(INSPECTION_MODE.TEXT_EXTRACTION, 'body',{});

  return (<div>
    <PreviewContext.Provider value={{contextValue,setContextValue}}>
      <PreviewHeader/>
    </PreviewContext.Provider>
    {
      <section className={previewCardStyle.previewPage}>{
        isModifying ? 
          (<ModelInput setModel={(modelName:string)=>setContextValue({
            ...contextValue,
            curNote: {...curNote, modelId: modelName},
            isChanged:true
          })} defaultModel={curNote.modelId}/>) : 'Model :' + curNote.modelId
      }
        <Tags givenTags={curNote.tags} isModifying={isModifying} 
        onAddTag={(tag)=>{
          setContextValue({...contextValue,
            curNote: {...curNote, tags: [...curNote.tags, tag]},
            isChanged:true});
        }} 
        onRemoveTag={(tag)=>{
          setContextValue({...contextValue, 
            curNote: {...curNote, tags: curNote.tags.filter(t=>t!==tag)},
            isChanged:true});
        }}/>
        <h3>front preview {isModifying ?? <SimpleButton title="Extract Text" src={MagicIcon} onClick={()=>enterInspectionMode(onResult)}/>}</h3>
        {
          isModifying ?
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Front}
            width='100%'
            height='200px'
            theme={themeOption.theme === THEME.DARK ? "vs-dark" : "light"}
            onChange={(value)=>{
              setContextValue({...contextValue,
                curNote:{...curNote, fields: {...curNote.fields, Front: value || ''}},
                isChanged:true});
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
        <h3>back preview {isModifying ?? <SimpleButton title="Extract Text" src={MagicIcon} onClick={()=>enterInspectionMode(onResult)}/> }</h3>
        {
          isModifying ? 
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Back}
            width='100%'
            height='200px'
            theme={themeOption.theme === THEME.DARK ? "vs-dark" : "light"}
            onChange={(value)=>{
              setContextValue({...contextValue,
                curNote:{...curNote, fields: {...curNote.fields, Back: value || ''}},
                isChanged:true});
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
      </section>      
    }
    {isInspectionMode && <InspectionOverlay mode={INSPECTION_MODE.TEXT_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
  </div>);
};
export default PreviewCard;