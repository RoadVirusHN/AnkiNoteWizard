import useTemplate from "@/front/utils/useTemplates";
import previewCardStyle from "./previewCard.module.css";
import { useParams } from "react-router";
import { useState } from "react";
import Tags from "@/front/common/Tags/Tags";
import { Editor } from "@monaco-editor/react";
import InspectionOverlay from "@/front/common/InspectionOverlay/InspectionOverlay";
import Preview from "@/front/common/Preview/Preview";
import PreviewHeader from "./PreviewHeader/PreviewHeader";
import { PreviewContext } from "./PreviewContext";
import { InspectionMode } from "@/scripts/content/tagExtraction_bak";
import ModelInput from "@/front/common/Inputs/ModelInput/ModelInput";
import useConfigure, { Theme } from "@/front/utils/useConfigure";
import useInspection from "@/front/utils/useInspection";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";
import SimpleButton from "@/front/common/SimpleButton/SimpleButton";

const PreviewCard = ({}) => {
  const {index} = useParams();
  const idx = index ?? '0-0';
  const {notes} = useTemplate();
  const [contextValue, setContextValue] = useState({isChanged: false, isModifying : false,curNote: notes[idx], idx});
  const {curNote, isModifying, isChanged} = contextValue; 
  const [curText, setCurText] = useState('');
  const {themeOption} = useConfigure();
  const onResult = (text:string) => setCurText(text);
  const {enterInspectionMode,cancleInspectionMode,isInspectionMode} = useInspection(InspectionMode.TEXT_EXTRACTION, 'body',{});

  return (<div>
    <PreviewContext.Provider value={{contextValue,setContextValue}}>
      <PreviewHeader/>
    </PreviewContext.Provider>
    {
      <section className={previewCardStyle.previewPage}>{
        isModifying ? 
          (<ModelInput setModel={(modelName:string)=>setContextValue({
            ...contextValue,
            curNote: {...curNote, modelName},
            isChanged:true
          })} defaultModel={curNote.modelName}/>) : 'Model :' + curNote.modelName
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
            theme={themeOption.theme === Theme.DARK ? "vs-dark" : "light"}
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
            <Preview html={curNote.fields.Front}/>
        }
        <h3>back preview {isModifying ?? <SimpleButton title="Extract Text" src={MagicIcon} onClick={()=>enterInspectionMode(onResult)}/> }</h3>
        {
          isModifying ? 
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Back}
            width='100%'
            height='200px'
            theme={themeOption.theme === Theme.DARK ? "vs-dark" : "light"}
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
          : <Preview html={curNote.fields.Back}/>
        }
      </section>      
    }
    {isInspectionMode && <InspectionOverlay mode={InspectionMode.TEXT_EXTRACTION} cancleInspectionMode={cancleInspectionMode}/>}
  </div>);
};
export default PreviewCard;