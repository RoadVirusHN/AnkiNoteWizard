import SimpleButton from "../SimpleButton/SimpleButton";
import { Dispatch, SetStateAction, useState } from "react";
import { PortNames } from "@/scripts/background/connectHandler";
import { MessageType } from "@/scripts/background/messageHandler";
import { InspectionMode } from "@/scripts/content/tagExtraction";
import inspectionButtonStyle from "./InspectionButton.module.css";
import MagicIcon from "@/public/Icon/Icon-Magic.svg";

const InspectionButton = ({setResult, mode=InspectionMode.TAG_EXTRACTION}:{setResult: (text:string)=>void, mode?: InspectionMode}) => {
  const [panelPort, setPanelPort] = useState<chrome.runtime.Port|null>();
  return <>
    <div className={inspectionButtonStyle.overlay} style={{display:panelPort ? 'flex':'none'}} 
    onClick={()=>{
      if (panelPort!=null) {
        console.log("cancle inspection mode");
        panelPort.disconnect();
        setPanelPort(null);
      }
    }}>  
      <div className={inspectionButtonStyle['instruction-box']}>
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
        {
          mode==InspectionMode.TEXT_EXTRACTION ?(<>
            <h1>Text Extraction Mode</h1>
            <ol>
                <li>Hover over the text</li>
                <li>Click to copy into your clipboard.</li>
                <li>Paste the text where you want!</li>
            </ol></>) : (<>
              <h1>Tag Inspection Mode</h1>
              <ol>
                  <li>Hover over the Tag</li>
                  <li>Click to pop up the menu
                    <ul>
                      <li>"Extract text" : copy the text Content.</li>
                      <li>"Extract Selector" : copy the CSS Selector of the tag.</li>
                      <li>"Select Children" : change target tag to a child.</li>
                    </ul>
                  </li>

                  <li>Select to copy data into your clipboard.</li>
              </ol>
            </>)
        }
        <h2>* Click here to exit mode.</h2> 
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
        <span className={inspectionButtonStyle['left-pointer']}>◀</span>
      </div>
     </div>
    <SimpleButton title="Extract Text" src={MagicIcon} onClick={async ()=>{
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
          setPanelPort(null);
        });
        newPort.onDisconnect.addListener(()=>{
          // 탭이 닫히거나 에러 등으로 포트가 끊어졌을 때 처리
          console.log("inspection mode disconnected");
          setPanelPort(null);
        });
      }
    }}/> 
  </> ;
};
export default InspectionButton;