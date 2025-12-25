import ExtractIcon from "@/public/Icon/Icon-Code.svg"
import SimpleButton from "../SimpleButton/SimpleButton";
import { Dispatch, SetStateAction, useState } from "react";
import { PortNames } from "@/scripts/background/connectHandler";
import { MessageType } from "@/scripts/background/messageHandler";
import { InspectionMode } from "@/scripts/content/tagExtraction";
import inspectionButtonStyle from "./InspectionButton.module.css";


const InspectionButton = ({setResult, mode=InspectionMode.TAG_EXTRACTION}:{setResult: Dispatch<SetStateAction<string>>, mode?: InspectionMode}) => {
  const [panelPort, setPanelPort] = useState<chrome.runtime.Port|null>();
  return <>
    <div className={inspectionButtonStyle.overlay} style={{display:panelPort ? 'flex':'none'}} 
    onClick={()=>{
      if (panelPort!=null)  {
        console.log("cancle inspection mode");
        panelPort.disconnect();
        setPanelPort(null);
      }
    }}>  
      <h3>You are in "Inspection Mode"</h3>
      <span><span style={{fontSize:'xx-large'}}>☜</span> Click a Tag in your page to copy data at the clipboard.</span>
      <span>Click here to Cancle.</span>
    
     </div>
    <SimpleButton Svg={ExtractIcon} onClick={async ()=>{
      if (panelPort!=null)  {
        console.log("disconnect previous port");
        panelPort.disconnect();
      }
      const newPort = chrome.runtime.connect({ name: mode==InspectionMode.TEXT_EXTRACTION ? PortNames.ENTER_TEXT_INSPECTION_MODE_FROM_PANEL : PortNames.ENTER_TAG_INSPECTION_MODE_FROM_PANEL });
      setPanelPort(newPort);
      if (newPort){
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const tabId = tab.id;
        newPort.postMessage({type:MessageType.SET_INSPECTION_TAB_ID, tabId });
        newPort.onMessage.addListener((msg)=>{
          let data = msg.data as string;
          setResult(data.trim());
          newPort.disconnect();
        });
        newPort.onDisconnect.addListener(()=>{
          console.log("inspection mode disconnected");
          setPanelPort(null);
        });
      }
    }}/> 
    <SimpleButton text="cancle" onClick={()=>{
      console.log(panelPort);
      if (panelPort!=null)  {
        console.log("cancle inspection mode");
        panelPort.disconnect();
        setPanelPort(null);
      }
    }}/>
  </> ;
};
export default InspectionButton;