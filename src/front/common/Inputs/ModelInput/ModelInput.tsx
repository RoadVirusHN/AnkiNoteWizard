import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import { useState } from "react";
const ModelInput = ({setModel, defaultModel}:{setModel: (model:string)=>void, defaultModel: string}) => {
  const {models} = useAnkiConnectionStore();
  const [curVal, setCurVal] = useState(defaultModel || models[0] || ''); 
  const onChangeModel = (model:string) => {
    if (models.length===0) return;
    setModel(model);
  }
  return (
    <div>
      <label htmlFor="model-select">
        Model 
      </label>
      <select id="model-select" name="model-select" style={{height: '20px', width: '180px'}} onChange={(e)=>{
        onChangeModel(e.currentTarget.value); 
        setCurVal(e.currentTarget.value);
      }} value={curVal}>
        {models.length > 0 ? models.map((model) => <option key={model} value={model}>{model}</option>) : (
          <option value=''>Check Anki Connection!</option>          
        )}
      </select>
    </div>
  );
};
export default ModelInput;