import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { useState } from "react";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";
const ModelInput = ({setModelId, defaultModelId,errorMessages}:{setModelId: (modelId:string)=>void, defaultModelId: string, errorMessages: string[]}) => {
  const {models} = useAnkiConnectionStore();
  const [curVal, setCurVal] = useState(defaultModelId || models[0].id || ''); 
  const onChangeModel = (modelId:string) => {
    if (Object.keys(models).length===0) return;
    setModelId(modelId);
  }
  const {t} = useTranslation('common');
  const {t:tModelInput} = useTranslation('components', {keyPrefix: 'modelInput'});
  const errorMessage = errorMessages.length > 0 ? errorMessages.join(',\n') : '';
  return (
    <SimpleSelect 
      inputId="modelInput"
      label={t('model')} 
      defaultValue={curVal} 
      isEssential={true}
      errorMessage={errorMessage}
      options={
        Object.keys(models).length === 0 ? [{key:tModelInput('ankiConnectionError'), val:'', isDisabled: false}] :
        [{key:t('select{{word}}',{word: t('model')}), val: '',isDisabled:true},...Object.keys(models).map((modelId) => ({key: models[modelId].name, val: modelId}))]
      }
      onChange={(e)=>{onChangeModel(e.currentTarget.value); setCurVal(e.currentTarget.value);}}
      />
  );
};
export default ModelInput;