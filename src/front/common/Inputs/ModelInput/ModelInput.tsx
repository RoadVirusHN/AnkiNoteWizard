import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import DecksIcon from "@/public/Icon/Icon-Decks.svg";
import statusBarStyle from "../statusBar.module.css";
import useGlobalVarStore from "@/front/utils/useGlobalVarStore";
const ModelInput = ({setModel}:{setModel: (model:string)=>void}) => {
  const {models} = useAnkiConnectionStore();
  
  const onChangeModel = (model:string) => {
    if (models.length===0) return;
    setModel(model);
  }
  return (
    <div className={statusBarStyle.deckSelector}>
      <label htmlFor="deck-select">
         <img src={DecksIcon} />
      </label>
      <select id="deck-select" name="deck-select" style={{height: '20px', width: '180px'}} onChange={(e)=>{onChangeModel(e.currentTarget.value)}} value={currentDeck??''}>
        {models.length>0? models.map((model) => <option key={model} value={model}>{model}</option>) : <option value=''>Check Anki Connection!</option>}
      </select>
    </div>
  );
};
export default ModelInput;