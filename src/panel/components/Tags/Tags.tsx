import tagsStyle from "./tags.module.css";
import useScanRule from "@/panel/stores/useScanRule";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import {
  getComplementaryColor,
  getRandomColor,
} from "@/panel/utils/functions";
import { useTranslation } from "react-i18next";
import Icon from "../Icon/Icon";
import { Tag } from "@/types/scanRule.types";
import {
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

interface TagsProps {
  givenTagIds: string[];
  isModifying?: boolean;
  onRemoveTag?: (tag: Tag) => void;
  onAddTag?: (tag: Tag) => void;
}

const Tags = ({
  givenTagIds,
  isModifying = false,
  onRemoveTag = () => {},
  onAddTag = () => {},
}: TagsProps) => {
  const { tags, addTag } = useScanRule();
  const { t } = useTranslation("common");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addButtonRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    // TODO: research this too.
    requestAnimationFrame(() => {
      addButtonRef.current?.scrollIntoView({
        behavior: "smooth",
        inline: "end",
        block: "nearest",
      });
    });
  };
  const deleteTag = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    onRemoveTag(tag);
  };

  const insertTag = () =>{
    const input = inputRef.current;
    if (!input) return;

    const newTagId = input.value;

    if(newTagId && !givenTagIds.find(id=>id === newTagId)){
      let randomColor = getRandomColor();
      const existingTag = tags[newTagId];

      if(!existingTag){
        addTag(newTagId, randomColor);
      }

      onAddTag({
        name:newTagId,
        color: existingTag ? existingTag.color : randomColor
      });

      input.value = '';

      scrollToEnd();
    }
  }
  //TODO: research it
  useLayoutEffect(() => {
    scrollToEnd();
  }, [givenTagIds]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
  
    const wheelHandler = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
  
      e.preventDefault();
      e.stopPropagation();
  
      el.scrollLeft += e.deltaY;
    };
  
    el.addEventListener("wheel", wheelHandler, {
      passive: false,
    });
  
    return () => {
      el.removeEventListener("wheel", wheelHandler);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={tagsStyle.tags}
      onClick={(e) => e.stopPropagation()}
    >
      {givenTagIds.map((id) => {
        // TODO: make Tag component
        const tag = tags[id];
        let tagColor = tag ? tag.color : getRandomColor();
        if (tag === null) addTag(id, tagColor);
        return (
          <span
            key={id}
            className={tagsStyle.tag}
            style={{
              backgroundColor: tag!.color,
              color: getComplementaryColor(tag!.color),
            }}
          >
            {tag!.name}
            {isModifying && (
              <span
                style={{ cursor: "pointer" }}
                onClick={(e) => deleteTag(e, tag!)}
              >
                {" "}
                ⨂
              </span>
            )}
          </span>
        );
      })}
      {isModifying && (
        <>
          <input
            ref={inputRef}
            className={tagsStyle.tagInput}
            type="text"
            placeholder={t("newTag")}
            onKeyDown={(e) => {
              if (e.key === "Enter") insertTag();
            }}
            onInput={scrollToEnd}
          />
          <div ref={addButtonRef}>
            <Icon
              url={AddIcon}
              className={tagsStyle.tagAdder}
              handleClick={insertTag}
              />
          </div>
        </>
      )}
    </div>
  );
};

export default Tags;