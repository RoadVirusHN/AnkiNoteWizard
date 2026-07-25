import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { ChangeEvent, JSX, useState } from "react";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";

const DeckInput = ({initDeckId,onChange,label, errorMessages}:{initDeckId? : string, onChange : (e:ChangeEvent<HTMLSelectElement>)=>void, label?:string|JSX.Element, errorMessages: string[]}) => {
  const {decks} = useAnkiConnectionStore();
  const [curVal, setCurVal] = useState(initDeckId || (Object.keys(decks).length>0? Object.keys(decks)[0]: ''));
  const errorMessage = errorMessages.length > 0 ? errorMessages.join(',\n') : '';
  console.log('error in Deck', errorMessage);
  const {t} = useTranslation('common');
  return (
    <SimpleSelect
      inputId= "deckInput"
      label={label}
      defaultValue={curVal} 
      isEssential={label?true:false}
      errorMessage={errorMessages.join(',\n')}
      options={
        Object.keys(decks).length === 0 ? [{key:t('checkAnkiConnection'), val:''}] :
        [{key:t('select|word|', {word: t('deck')}), val:'', isDisabled:true},...Object.keys(decks).map((name) => ({key: name, val: name}))]
      }
      onChange={(e)=>{onChange(e); setCurVal(e.currentTarget.value)}}/>
  );
};
export default DeckInput;