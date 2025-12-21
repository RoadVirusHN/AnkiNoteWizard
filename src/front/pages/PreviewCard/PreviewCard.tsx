import useTemplate from "@/front/utils/useTemplates";
import previewCardStyle from "./previewCard.module.css";
import { useParams } from "react-router";
import { useContext, useState } from "react";
import Tags from "@/front/common/Tags/Tags";
import { Editor } from "@monaco-editor/react";
import InspectionButton from "@/front/common/InspectionButton/InspectionButton";
import Preview from "@/front/common/Preview/Preview";
import PreviewHeader from "./PreviewHeader/PreviewHeader";
import { PreviewContext } from "./PreviewContext";

const PreviewCard = ({}) => {
  const {index} = useParams();
  const idx = index ?? '0-0';
  const {notes} = useTemplate();
  const [contextValue, setContextValue] = useState({isChanged: false, isModifying : false,curNote: notes[idx], idx});
  const {curNote, isModifying, isChanged} = contextValue; 
  const [curText, setCurText] = useState('');
  return (<div>
    <PreviewContext.Provider value={{contextValue,setContextValue}}>
      <PreviewHeader/>
    </PreviewContext.Provider>
    {
      <section className={previewCardStyle.previewPage}>
        <div style={{display: 'flex', margin: '5px'}}>
          <h2 style={{margin: '0'}}> {curNote.modelName}</h2>
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
        </div>
        {curText}

        <h3>front preview{isModifying ? <InspectionButton setResult={setCurText}/> : ''}</h3>
        {
          isModifying ?
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Front}
            width='100%'
            height='200px'
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
        <h3>back preview</h3>
        {
          isModifying ? 
          (<Editor
            defaultLanguage="html"
            value={curNote.fields.Back}
            width='100%'
            height='200px'
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
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
        <h3>back preview</h3>
  </div>);
};
export default PreviewCard;