import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { useState } from "react";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";
const ModelInput = ({setModelId, defaultModelId ,errorMessages}:{setModelId: (modelId:string)=>void, defaultModelId: string, errorMessages: string[]}) => {
  // make sure use models directly instead of getModels, because getModels does not trigger re-render when models change
  const {models, getModel} = useAnkiConnectionStore();
  const [curVal, setCurVal] = useState(defaultModelId || (Object.keys(models).length>0? Object.keys(models)[0]: '-1'));
  console.log(curVal); 
  const onChangeModel = (modelId:string) => {
    if (!modelId||!getModel(modelId)||Object.keys(models).length===0) return;
    setModelId(modelId);
  }
  const {t} = useTranslation('common');
  const errorMessage = errorMessages.length > 0 ? errorMessages.join(',\n') : '';
  return (
    <SimpleSelect 
      inputId="modelInput"
      label={t('model')} 
      defaultValue={curVal} 
      isEssential={true}
      errorMessage={errorMessage}
      options={
        Object.keys(models).length === 0 ? [{key:t('checkAnkiConnection'), val:'', isDisabled: false}] :
        [...Object.keys(models).map((key) => {
          const model = getModel(key);
          if (!model) return {key: t('checkAnkiConnection'), val:'', isDisabled: true};
          return {key: model.name, val: model.id};
        })]
      }
      onChange={(e)=>{onChangeModel(e.currentTarget.value); setCurVal(e.currentTarget.value);}} 
      />
  );
};
export default ModelInput;