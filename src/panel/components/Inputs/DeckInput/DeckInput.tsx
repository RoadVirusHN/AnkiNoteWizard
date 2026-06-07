import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import { JSX, useState } from "react";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";

const DeckInput = ({initDeck,onChange,label, errorMessages}:{initDeck? : string, onChange? : (deck:string)=>void, label?:string|JSX.Element, errorMessages: string[]}) => {
  const {decks} = useAnkiConnectionStore();
  const {currentDeck,setCurrentDeck} = useGlobalVarStore();
  const [curDeck, setCurDeck] = useState(initDeck || currentDeck);
  const onChangeDeck = (deck:string) => {
    if (decks.length===0) return;
    setCurrentDeck(deck);
  }
  const errorMessage = errorMessages.length > 0 ? errorMessages.join(',\n') : '';
  const {t} = useTranslation('common');
  return (
    <SimpleSelect
      inputId= "deckInput"
      label={label}
      defaultValue={curDeck} 
      isEssential={true}
      errorMessage={errorMessage}
      options={
        decks.length === 0 ? [{key:t('ankiDisconnected'), val:'', isDisabled: true}] :
        [{key:t('select{{word}}', {word: t('deck')}), val:'', isDisabled:true},...decks.map((deck) => ({key: deck, val: deck}))]
      }
      onChange={(e)=>{
        setCurDeck(e.currentTarget.value);
        if(onChange) onChange(e.currentTarget.value);
        else onChangeDeck(e.currentTarget.value);
      }}/>
  );
};
export default DeckInput;