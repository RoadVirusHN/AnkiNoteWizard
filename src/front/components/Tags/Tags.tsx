import { useEffect, useState } from "react";
import tagsStyle from "./tags.module.css";
import SimpleButton from "../SimpleButton/SimpleButton";
import useTemplate from "@/front/utils/useTemplates";

const getRandomColor = ()=> '#'+Math.floor(Math.random()*16777215).toString(16); 
const getComplementaryColor = (hex: string) => {
  // Remove the hash if it exists
  hex = hex.replace('#', '');

  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Invert the RGB values
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;

  // Convert RGB to hex
  const toHex = (c : number) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface TagsProps {
  givenTags: string[];
  isModifying: boolean;
  onRemoveTag: (tag: string)=>void;
  onAddTag: (tag: string)=>void;
}

const Tags = ({givenTags, isModifying, onRemoveTag, onAddTag}:TagsProps) => {
  const {tags, addTag} = useTemplate();
  
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
    <span className={tagsStyle.badges}>
      {givenTags.map((tag)=>{
        let tagColor = tags[tag] ? tags[tag].color : getRandomColor();
        if (tags[tag]===undefined) addTag(tag, tagColor);
        return (<span className={tagsStyle.tag} style={{backgroundColor: tags[tag].color, color: getComplementaryColor(tags[tag].color)}}>{tag} 
        {isModifying ? <span style={{cursor: 'pointer'}} onClick={(e)=>deleteTag(e,tag)}> ⨂</span> : ''}
        </span>);
      }
    )}
    </span> 
    {isModifying ? <span>
    <input id="tagInput" className={tagsStyle.tagInput} type='text' placeholder="Add New Tag" 
    onKeyDown={(e)=>{if (e.key=='enter') insertTag()}}/> 
    <span style={{cursor: 'pointer'}} onClick={insertTag}> ⨁</span>
    </span> : null}
  </div>);
};
export default Tags;