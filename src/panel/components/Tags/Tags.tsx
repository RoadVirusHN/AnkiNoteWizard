import tagsStyle from "./tags.module.css";
import useScanRule from "@/panel/stores/useScanRule";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import { getComplementaryColor, getRandomColor } from "@/panel/utils/functions";
import { useTranslation } from "react-i18next";
import Icon from "../Icon/Icon";


interface TagsProps {
  givenTags: string[];
  isModifying: boolean;
  onRemoveTag: (tag: string)=>void;
  onAddTag: (tag: string)=>void;
}

const Tags = ({givenTags, isModifying, onRemoveTag, onAddTag}:TagsProps) => {
  const {tags, addTag} = useScanRule();
  const {t} = useTranslation();
  const deleteTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onRemoveTag(tag);
  }

  const insertTag = () =>{
    const input = document.getElementById('tagInput') as HTMLInputElement;
    const newTag = input.value;
    if(newTag && !givenTags.includes(newTag)){
      if(!tags[newTag]){
        let randomColor = getRandomColor();
        addTag(newTag, randomColor);
      }
      onAddTag(newTag);
      input.value = '';
    }
  }
  return (<div className={tagsStyle.tags}>
      {givenTags.map((tag)=>{
        let tagColor = tags[tag] ? tags[tag].color : getRandomColor();
        if (tags[tag]===undefined) addTag(tag, tagColor);
        // TODO: Make Tag Component
        return (<span key={tag} className={tagsStyle.tag} style={{backgroundColor: tags[tag].color, color: getComplementaryColor(tags[tag].color)}}>{tag} 
        {isModifying ? <span style={{cursor: 'pointer'}} onClick={(e)=>deleteTag(e,tag)}> ⨂</span> : ''}
        </span>);
      }
    )}
    {isModifying ? <>
    <input id="tagInput" className={tagsStyle.tagInput} type='text' placeholder={t('common.new tag')} 
    onKeyDown={(e)=>{if (e.key==='Enter') insertTag()}}/> 
    <Icon url={AddIcon} className={tagsStyle.tagAdder} handleClick={insertTag}/></>
    : null}
  </div>);
};
export default Tags;