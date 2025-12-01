import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import DecksIcon from "@/public/Icon/Icon-Decks.svg";
import statusBarStyle from "../statusBar.module.css";
import useGlobalVarStore from "@/front/utils/useGlobalVarStore";
const DeckInput = ({}) => {
  const {decks} = useAnkiConnectionStore();
  const {currentDeck,setCurrentDeck} = useGlobalVarStore();
  const onChangeDeck = (deck:string) => {
    if (decks.length===0) return;
    setCurrentDeck(deck);
  }
  return (
    <div className={statusBarStyle.deckSelector}>
      <label htmlFor="deck-select">
         <DecksIcon />
      </label>
      <select id="deck-select" name="deck-select" style={{height: '20px', width: '180px'}} onChange={(e)=>{onChangeDeck(e.currentTarget.value)}} value={currentDeck??''}>
        {decks.length>0? decks.map((deck) => <option key={deck} value={deck}>{deck}</option>) : <option value=''>Check Anki Connection!</option>}
      </select>
    </div>
  );
};
export default DeckInput;