import { InspectionMode } from "@/scripts/content/tagExtraction2";
import { useState } from "react";
import { CssSelectorGeneratorOptionsInput } from "css-selector-generator/types/types";
import { PortNames } from "@/scripts/background/connectHandler";
import { MessageType } from "@/scripts/background/messageHandler";

interface UseInspectionParams {  
  mode: InspectionMode;
  rootSelector: string;
  cssSelectorOptions: CssSelectorGeneratorOptionsInput;
  onResult: (text:string)=>void;
  onEnter: ()=>void;
  onCancel: ()=>void;
}

const useInspection = ({
  mode = InspectionMode.TEXT_EXTRACTION,
  rootSelector = 'body',
  cssSelectorOptions,
  onResult,
  onEnter,
  onCancel,
}:UseInspectionParams) => {

  const [panelPort, setPanelPort] = useState<chrome.runtime.Port|null>();
  const [isInspectionMode, setIsInspectionMode] = useState(false);

  const enterInspectionMode = async () => {
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
        newPort.disconnect();
        setPanelPort(null);
        onCancel();
        setIsInspectionMode(false);
      });
      newPort.onDisconnect.addListener(()=>{
        setPanelPort(null);
        onCancel();
        setIsInspectionMode(false);
      });
      setIsInspectionMode(true);
    }
    onEnter();
  };
  
  const cancleInspectionMode = () => {
    if (panelPort!=null){
      console.log("cancle inspection mode");
      panelPort.disconnect();
      setPanelPort(null);    
    }
    setIsInspectionMode(false);
    onCancel();
  };
  

  return [enterInspectionMode, cancleInspectionMode, isInspectionMode];
};

export default useInspection;
