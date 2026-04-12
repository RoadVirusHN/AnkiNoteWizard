import { useState } from "react";
import { CssSelectorGeneratorOptionsInput } from "css-selector-generator/types/types";
import { MessageType, PortNames } from 'types/chrome.types';
import { InspectionMode } from "@/scripts/content/constants";

interface _UseInspectionParams {  
  mode: InspectionMode;
  rootSelector: string;
  cssSelectorOptions: CssSelectorGeneratorOptionsInput;
  onResult: (text:string)=>void;
  onEnter: ()=>void;
}

const useInspection = (
  mode = InspectionMode.TEXT_EXTRACTION,
  rootSelector = 'body',
  cssSelectorOptions = {} as CssSelectorGeneratorOptionsInput
) => {

  const [panelPort, setPanelPort] = useState<chrome.runtime.Port|null>();
  const [isInspectionMode, setIsInspectionMode] = useState(false);

  const enterInspectionMode = async (onResult=(text:string)=>{}, onCancle=()=>{}) => {
    if (panelPort!=null)  {
      console.log("disconnect previous port");
      panelPort.disconnect();
    }
    const newPort = chrome.runtime.connect({ name: PortNames.ENTER_INSPECTION_MODE_FROM_PANEL});
    setPanelPort(newPort);
    if (newPort){
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const tabId = tab.id;
      newPort.postMessage({type:MessageType.SET_INSPECTION_TAB_ID, tabId, data: {mode, rootSelector, cssSelectorOptions} });
      newPort.onMessage.addListener((msg)=>{
        let data = msg.data as string;
        onResult(data.trim());
        cancleInspectionMode(onCancle);
      });
      newPort.onDisconnect.addListener(()=>{
        cancleInspectionMode(onCancle);
      });
      setIsInspectionMode(true);
    }
  };
  
  const cancleInspectionMode = (onCancle=()=>{}) => {
    if (panelPort!=null){
      console.log("cancle inspection mode");
      panelPort.disconnect();
      setPanelPort(null);    
    }
    setIsInspectionMode(false);
    onCancle();
  };
  

  return {enterInspectionMode, cancleInspectionMode, isInspectionMode};
};

export default useInspection;
