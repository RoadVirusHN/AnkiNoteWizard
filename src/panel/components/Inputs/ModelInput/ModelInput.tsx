import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { useState } from "react";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";
const ModelInput = ({setModelId, defaultModelId ,errorMessages}:{setModelId: (modelId:string)=>void, defaultModelId: string, errorMessages: string[]}) => {
  const {models} = useAnkiConnectionStore();
  const modelKeys = Object.keys(models);
  const [curVal, setCurVal] = useState(modelKeys.includes(defaultModelId) ? defaultModelId : (modelKeys.length > 0 ? modelKeys[0] : ''));
  
  const onChangeModel = (modelId:string) => {
    if (!modelId||!models[modelId]||Object.keys(models).length===0) return;
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
          const model = models[key];
          if (!model) return {key: t('checkAnkiConnection'), val:'', isDisabled: true};
          return {key: model.name, val: model.id};
        })]
      }
      onChange={(e)=>{onChangeModel(e.currentTarget.value); setCurVal(e.currentTarget.value);}} 
      />
  );
};
export default ModelInput;