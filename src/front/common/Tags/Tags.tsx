import tagsStyle from "./tags.module.css";
import useTemplate from "@/front/utils/useTemplates";
import { getComplementaryColor, getRandomColor } from "@/front/utils/functions";


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
      {givenTags.map((tag)=>{
        let tagColor = tags[tag] ? tags[tag].color : getRandomColor();
        if (tags[tag]===undefined) addTag(tag, tagColor);
        // TODO: Make Tag Component
        return (<span key={tag} className={tagsStyle.tag} style={{backgroundColor: tags[tag].color, color: getComplementaryColor(tags[tag].color)}}>{tag} 
        {isModifying ? <span style={{cursor: 'pointer'}} onClick={(e)=>deleteTag(e,tag)}> ⨂</span> : ''}
        </span>);
      }
    )}
    {isModifying ? <div className={tagsStyle.tags}>
    <input id="tagInput" className={tagsStyle.tagInput} type='text' placeholder="New Tag" 
    onKeyDown={(e)=>{if (e.key==='Enter') insertTag()}}/> 
    <span style={{cursor: 'pointer'}} onClick={insertTag}> ⨁</span>
    </div> : null}
  </div>);
};
export default Tags;