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
      if(!tags[newTagId]){
        addTag(newTagId, randomColor);
      }
      onAddTag({name:newTagId, color: tags[newTagId] ? tags[newTagId].color : randomColor});
      input.value = '';
    }
  }
  return (<div className={tagsStyle.tags}>
      {givenTagIds.map((id)=>{
        let tagColor = tags[id] ? tags[id].color : getRandomColor();
        if (tags[id]===undefined) addTag(id, tagColor);
        // TODO: Make Tag Component
        return (<span key={id} className={tagsStyle.tag} style={{backgroundColor: tags[id].color, color: getComplementaryColor(tags[id].color)}}>{tags[id].name} 
        {isModifying ? <span style={{cursor: 'pointer'}} onClick={(e)=>deleteTag(e,tags[id])}> ⨂</span> : ''}
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