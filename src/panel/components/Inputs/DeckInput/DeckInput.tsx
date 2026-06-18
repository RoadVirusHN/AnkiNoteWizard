import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import useGlobalVarStore from "@/panel/stores/useGlobalVarStore";
import { ChangeEvent, JSX, useState } from "react";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";
import { Deck } from "@/types/scanRule.types";

const DeckInput = ({initDeckId,onChange,label, errorMessages}:{initDeckId? : string, onChange : (e:ChangeEvent<HTMLSelectElement>)=>void, label?:string|JSX.Element, errorMessages: string[]}) => {
  const {decks} = useAnkiConnectionStore();
  const errorMessage = errorMessages.length > 0 ? errorMessages.join(',\n') : '';
  const {t} = useTranslation('common');
  return (
    <SimpleSelect
      inputId= "deckInput"
      label={label}
      defaultValue={initDeckId||''} 
      isEssential={label?true:false}
      errorMessage={errorMessage}
      options={
        Object.keys(decks).length === 0 ? [{key:t('ankiDisconnected'), val:'', isDisabled: true}] :
        [{key:t('select|word|', {word: t('deck')}), val:'', isDisabled:true},...Object.keys(decks).map((name) => ({key: name, val: name}))]
      }
      onChange={onChange}/>
  );
};
export default DeckInput;