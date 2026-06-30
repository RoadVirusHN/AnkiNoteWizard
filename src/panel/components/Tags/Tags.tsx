import tagsStyle from "./tags.module.css";
import useScanRule from "@/panel/stores/useScanRule";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import { getComplementaryColor, getRandomColor } from "@/panel/utils/functions";
import { useTranslation } from "react-i18next";
import Icon from "../Icon/Icon";
import { Tag } from "@/types/scanRule.types";


interface TagsProps {
  givenTagIds: string[];
  isModifying?: boolean;
  onRemoveTag?: (tag: Tag)=>void;
  onAddTag?: (tag: Tag)=>void;
}

const Tags = ({givenTagIds, isModifying=false, onRemoveTag=(t)=>{}, onAddTag=(t)=>{}}:TagsProps) => {
  const {tags, addTag} = useScanRule();
  const {t} = useTranslation('common');
  const deleteTag = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    onRemoveTag(tag);
  }

  const insertTag = () =>{
    const input = document.getElementById('tagInput') as HTMLInputElement;
    const newTagId = input.value;
    if(newTagId && !givenTagIds.find(id=>id === newTagId)){
      let randomColor = getRandomColor();
      const existingTag = tags[newTagId];
      if(!existingTag){
        addTag(newTagId, randomColor);
      }
      onAddTag({name:newTagId, color: existingTag ? existingTag.color : randomColor});
      input.value = '';
    }
  }
  return (<div className={tagsStyle.tags} onClick={(e)=>{e.stopPropagation();}}>
      {givenTagIds.map((id)=>{
        const tag = tags[id];
        let tagColor = tag ? tag.color : getRandomColor();
        if (tag===null) addTag(id, tagColor);
        // TODO: Make Tag Component
        return (<span key={id} className={tagsStyle.tag} style={{backgroundColor: tag!.color, color: getComplementaryColor(tag!.color)}}>{tag!.name} 
        {isModifying ? <span style={{cursor: 'pointer'}} onClick={(e)=>deleteTag(e,tag!)}> ⨂</span> : ''}
        </span>);
      }
    )}
    {isModifying ? <>
    <input id="tagInput" className={tagsStyle.tagInput} type='text' placeholder={t('newTag')} 
    onKeyDown={(e)=>{if (e.key==='Enter') insertTag()}}/> 
    <Icon url={AddIcon} className={tagsStyle.tagAdder} handleClick={insertTag}/></>
    : null}
  </div>);
};
export default Tags;