import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { useEffect, useState } from "react";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import { useTranslation } from "react-i18next";

interface ModelInputProps {
  setModelId: (newModelId:string)=>boolean;
  defaultModelId: string;
  errorMessages: string[];
}

const ModelInput = ({setModelId, defaultModelId ,errorMessages}:ModelInputProps) => {
  // WARN : defaultModelId는 최초에 setModelId를 실행하지 않으며, ModelInput 의존 컴포넌트가 시작부터 알아서 defaultModelId를 적용한 상태여야 한다.
  const {models} = useAnkiConnectionStore();
  const modelKeys = Object.keys(models);
  const [curVal, setCurVal] = useState(defaultModelId);
  const onChangeModel = (modelId:string) => {
   if (!modelId||!models[modelId]||Object.keys(models).length===0) return;
    return setModelId(modelId);
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
      onChange={(e)=>{
        onChangeModel(e.currentTarget.value);
      }} 
      />
  );
};
export default ModelInput;