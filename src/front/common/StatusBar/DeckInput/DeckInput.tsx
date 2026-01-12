import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import DecksIcon from "@/public/Icon/Icon-Decks.svg";
import statusBarStyle from "../statusBar.module.css";
import useGlobalVarStore from "@/front/utils/useGlobalVarStore";
import { useState } from "react";
const DeckInput = ({initDeck,onChange}:{initDeck? : string, onChange? : (deck:string)=>void}) => {
  const {decks} = useAnkiConnectionStore();
  const {currentDeck,setCurrentDeck} = useGlobalVarStore();
  const [curDeck, setCurDeck] = useState(initDeck || currentDeck);
  const onChangeDeck = (deck:string) => {
    if (decks.length===0) return;
    setCurrentDeck(deck);
  }
  return (
    <div className={statusBarStyle.deckSelector}>
      <label htmlFor="deck-select">
         <img src={DecksIcon} />
      </label>
      <select id="deck-select" name="deck-select" style={{height: '20px', width: '180px'}} 
        onChange={
          onChange ? (e)=>{
            setCurDeck(e.currentTarget.value);
            onChange(e.currentTarget.value);
          } : (e)=>{
            setCurDeck(e.currentTarget.value);
            onChangeDeck(e.currentTarget.value)
          }
      } value={curDeck}>
        {decks.length>0? decks.map((deck) => <option key={deck} value={deck}>{deck}</option>) : <option value=''>Check Anki Connection!</option>}
      </select>
    </div>
  );
};
export default DeckInput;